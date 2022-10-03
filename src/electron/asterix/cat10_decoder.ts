export class Cat10 {
    id: number;
    message_type: string;
    data_source_identifier: DataSourceIdentifier;
    target_report_description: TargetReportDescription;
    mod_3A_code: Mod3ACode;
    flight_level: FlightLevel;
    measured_height: string;
    alitude_of_primary_plot: number;
    time_of_day: string;
    track_number: number;
    track_status: TrackStatus;
    calculated_acceleration: CalculatedAcceleration;
    target_address: string;
    target_identification: TargetIdentification;
    mode_s_mb_data: string[];
    target_size_and_orientation: TargetSizeAndOrientation;
    presence: Presence[];
    vehicle_fleet_identification: string;
    preprogrammed_message: PreprogrammedMessage;
    standard_deviation_of_position: StandardDeviationOfPosition;
    system_status: SystemStatus;

    constructor(id: number) {
        this.id = id;
        this.message_type = "";
        this.time_of_day = "";
    }

    set_message_type = async (buffer: Buffer) => {
        switch (buffer[0]) {
            case 0x01: this.message_type = "Target Report"
                break;
            case 0x02: this.message_type = "Start of Update Cycle"
                break;
            case 0x03: this.message_type = "Periodic Status Message"
                break;
            case 0x04: this.message_type = "Event-triggered Status Message"
                break;
        }
    }

    set_data_source_identifier(buffer: Buffer) {
        var sac = '0x' + buffer.slice(0, 1).toString('hex');

        if (sac === '0x00') {
            sac = "0x00, Local airport Identifier";
        }

        const sic = '0x' + buffer.slice(1, 2).toString('hex');
        this.data_source_identifier = { SAC: sac, SIC: sic }
    }

    set_target_report_description = async (buffer: Buffer) => {
        const len = buffer.length;
        const bits = BigInt('0x' + buffer.toString('hex')).toString(2).padStart(len * 8, '0').split('');
        var typ = '';
        switch (bits.slice(0, 3).join('')) {
            case '000': typ = "SSR multilateration"
                break;
            case '001': typ = "Mode S multilateration"
                break;
            case '010': typ = "ADS-B"
                break;
            case '011': typ = "PSR"
                break;
            case '100': typ = "Magnetic Loop System"
                break;
            case '101': typ = "HF multilateration"
                break;
            case '110': typ = "Not defined"
                break;
            case '111': typ = "Other types"
                break;

        }

        var dcr = (bits[3] === "0") ? "No differential correction (ADS-B)" : "Differential correction (ADS-B)";
        var chn = (bits[4] === "0") ? "Chain 1" : "Chain 2";
        var gbs = (bits[5] === "0") ? "Transponder Ground bit not set" : "Transponder Ground bit set";
        var crt = (bits[6] === "0") ? "No Corrupted reply in multilateration" : "Corrupted replies in multilateration";

        if (len === 1) {
            this.target_report_description = { TYP: typ, DCR: dcr, CHN: chn, GBS: gbs, CRT: crt };
            return;
        }

        var sim = (bits[8] === "0") ? "Actual target report" : "Simulated target report";
        var tst = (bits[9] === "0") ? "Default" : "Test Target";
        var rab = (bits[10] === "0") ? "Report from target transponder" : "Report from field monitor (fixed transponder)";
        var lop = "";
        switch (bits.slice(11, 13).join('')) {
            case '00': lop = "Undetermined"
                break;
            case '01': lop = "Loop start"
                break;
            case '10': lop = "Loop finish"
                break;

        }
        var tot = "";
        switch (bits.slice(13, 15).join('')) {
            case '00': tot = "Undetermined"
                break;
            case '01': tot = "Aircraft"
                break;
            case '10': tot = "Ground vehicle"
                break;
            case '11': tot = "Helicopter"
                break;
        }

        if (len === 2) {
            this.target_report_description = {
                TYP: typ, DCR: dcr, CHN: chn, GBS: gbs, CRT: crt,
                SIM: sim, TST: tst, RAB: rab, LOP: lop, TOT: tot
            }
            return;
        }

        var sip = (bits[16] === "0") ? "Absence of SPI" : "Special Position Identification";

        this.target_report_description = {
            TYP: typ, DCR: dcr, CHN: chn, GBS: gbs, CRT: crt,
            SIM: sim, TST: tst, RAB: rab, LOP: lop, TOT: tot,
            SPI: sip
        }

    }

    set_mod_3A_code = async (buffer: Buffer) => {
        const bits = BigInt('0x' + buffer.toString('hex')).toString(2).padStart(2 * 8, '0').split('');
        var v = (bits[0] === "0") ? "Code validated" : "Code not validated";
        var g = (bits[1] === "0") ? "Default" : "Garbled code";
        var l = (bits[2] === "0") ? "Mode-3/A code derived from the reply of the transponder" : "Mode-3/A code not extracted during the last scan";
        var mode = parseInt('0x' + buffer.toString('hex')).toString(8).padStart(4, '0');

        this.mod_3A_code = { V: v, G: g, L: l, Mode: mode }
    }

    set_flight_level = async (buffer: Buffer) => {
        const bits = BigInt('0x' + buffer.toString('hex')).toString(2).padStart(2 * 8, '0').split('');
        var v = (bits[0] === "0") ? "Code validated" : "Code not validated";
        var g = (bits[1] === "0") ? "Default" : "Garbled code";
        var fl = (buffer.readInt16BE() / 4).toString(10) + "FL";

        this.flight_level = { V: v, G: g, FlightLevel: fl }
    }

    set_measured_height = async (buffer: Buffer) => {
        this.measured_height = (buffer.readInt16BE() * 6.25).toString() + "ft (Range= +/- 204 800 ft)"
    }

    set_alitude_of_primary_plot = async (buffer: Buffer) => {
        this.alitude_of_primary_plot = parseInt('0x' + buffer.toString('hex'));
    }

    set_time_of_day = async (buffer: Buffer) => {
        var sec = parseInt('0x' + buffer.toString('hex')) / 128.0;
        var date = new Date(0);
        date.setMilliseconds((sec * 1000));
        this.time_of_day = date.toISOString().substring(11, 23);
    }

    set_track_number = async (buffer: Buffer) => {
        this.track_number = parseInt('0x' + buffer.toString('hex'));
    }

    set_track_status = async (buffer: Buffer) => {
        const len = buffer.length;
        const bits = BigInt('0x' + buffer.toString('hex')).toString(2).padStart(len * 8, '0').split('');

        var cnf = (bits[0] === "0") ? "Confirmed track" : "Track in initialisation phase";
        var tre = (bits[1] === "0") ? "Default" : "Last report for a track";

        var cst = '';
        switch (bits.slice(2, 4).join('')) {
            case '00': cst = "No extrapolation"
                break;
            case '01': cst = "Predictable extrapolation due to sensor refresh period"
                break;
            case '10': cst = "Predictable extrapolation in masked area"
                break;
            case '11': cst = "Extrapolation due to unpredictable absence of detection"
                break;

        }

        var mah = (bits[4] === "0") ? "Default" : "Horizontal manoeuvre";
        var tcc = (bits[5] === "0") ? "Tracking performed in 'Sensor Plane', i.e. neither slant range correction nor projection was applied." : "Slant range correction and a suitable projection technique are used to track in a 2D.reference plane, tangential to the earth model at the Sensor Site co-ordinates.";
        var sth = (bits[6] === "0") ? "Measured position" : "Smoothed position";

        if (len === 1) {
            this.track_status = { CNF: cnf, TRE: tre, CST: cst, MAH: mah, TCC: tcc, STH: sth };
            return;
        }

        var tom = '';
        switch (bits.slice(8, 10).join('')) {
            case '00': tom = "Unknown type of movement"
                break;
            case '01': tom = "Taking-off"
                break;
            case '10': tom = "Landing"
                break;
            case '11': tom = "Other types of movement"
                break;

        }

        var dou = '';
        switch (bits.slice(10, 13).join('')) {
            case '000': dou = "No doubt"
                break;
            case '001': dou = "Doubtful correlation (undetermined reason)"
                break;
            case '010': dou = "Doubtful correlation in clutter"
                break;
            case '011': dou = "Loss of accuracy"
                break;
            case '100': dou = "Loss of accuracy in clutter"
                break;
            case '101': dou = "Unstable track"
                break;
            case '110': dou = "Previously coasted"
                break;
        }

        var mrs = '';
        switch (bits.slice(13, 15).join('')) {
            case '00': mrs = "Merge or split indication undetermined"
                break;
            case '01': mrs = "Track merged by association to plot"
                break;
            case '10': mrs = "Track merged by non-association to plot"
                break;
            case '11': mrs = "Split track"
                break;
        }

        if (len === 2) {
            this.track_status = {
                CNF: cnf, TRE: tre, CST: cst, MAH: mah, TCC: tcc, STH: sth,
                TOM: tom, DOU: dou, MRS: mrs
            };
            return;
        }

        var gho = (bits[16] === "0") ? "Default" : "Ghost track";

        this.track_status = {
            CNF: cnf, TRE: tre, CST: cst, MAH: mah, TCC: tcc, STH: sth,
            TOM: tom, DOU: dou, MRS: mrs,
            GHO: gho
        }
    }

    set_calculated_acceleration = async (buffer: Buffer) => {
        var ax = buffer.readIntBE(0, 1) * 0.25;
        var ay = buffer.readIntBE(1, 1) * 0.25;
        this.calculated_acceleration = { Ax: ax, Ay: ay }
    }

    set_target_address = async (buffer: Buffer) => {
        this.target_address = "0x" + buffer.toString('hex');
    }

    set_target_identification = async (buffer: Buffer) => {
        const bits = BigInt('0x' + buffer.toString('hex')).toString(2).padStart(7 * 8, '0').split('');
        var sti = ""; // Operational Release Status of the System
        switch (bits.slice(0, 2).join('')) {
            case '00': sti = "Callsign or registration downlinked from transponder"
                break;
            case '01': sti = "Callsign not downlinked from transponder"
                break;
            case '10': sti = "Registration not downlinked from transponder"
                break;

        }
        var target_identification = [];
        var start = 8;
        for (var i = 0; i < 8; i++) {
            target_identification.push(this.ti_parse(bits.slice(start, start + 6)))
            start += 6;
        }

        this.target_identification = { STI: sti, TargetIdentification: target_identification.join('') }

    }

    ti_parse = (bits: string[]) => {
        var res = "";
        var slice = bits.slice(0, 2).join('');
        if (slice === '11') { return parseInt(bits.slice(2, 6).join(''), 2).toString(10); }
        switch (bits.slice(2, 6).join('')) {
            case '0000': (slice === '01') ? res = "P" : res = " ";
                break;
            case '0001': (slice === '00') ? res = "A" : res = "Q";
                break;
            case '0010': (slice === '00') ? res = "B" : res = "R";
                break;
            case '0011': (slice === '00') ? res = "C" : res = "S";
                break;
            case '0100': (slice === '00') ? res = "D" : res = "T";
                break;
            case '0101': (slice === '00') ? res = "E" : res = "U";
                break;
            case '0110': (slice === '00') ? res = "F" : res = "V";
                break;
            case '0111': (slice === '00') ? res = "G" : res = "W";
                break;
            case '1000': (slice === '00') ? res = "H" : res = "X";
                break;
            case '1001': (slice === '00') ? res = "I" : res = "Y";
                break;
            case '1010': (slice === '00') ? res = "J" : res = "Z";
                break;
            case '1011': res = "K";
                break;
            case '1100': res = "L";
                break;
            case '1101': res = "M";
                break;
            case '1110': res = "N";
                break;
            case '1111': res = "O";
                break;
        }
        return res;
    }

    set_mode_s_mb_data = async (buffer: Buffer, rep: number) => {
        var start = 7;

        for (var i = 0; i < rep; i++) {
            try {
                var bits = BigInt('0x' + buffer.slice(start, start + 1).toString('hex')).toString(2).padStart(8, '0').split('');
                this.mode_s_mb_data.push("BDS1: " + parseInt(bits.slice(0, 4).join(''), 2).toString(10) + " BDS2: " + parseInt(bits.slice(4, 8).join(''), 2).toString(10));
                start += 8
            } catch { }
        }

    }

    set_target_size_and_orientation = async (buffer: Buffer) => {
        var length = parseInt(BigInt('0x' + buffer.slice(0, 1).toString('hex')).toString(2).padStart(8, '0').split('').slice(0, 7).join(''), 2).toString(10) + " m";
        if (buffer.length === 1) {
            this.target_size_and_orientation = {
                Lenght: length
            };
            return;
        }
        var orientation = (parseInt(BigInt('0x' + buffer.slice(1, 2).toString('hex')).toString(2).padStart(8, '0').split('').slice(0, 7).join(''), 2) * 360 / 128).toString(10) + " deg";
        if (buffer.length === 2) {
            this.target_size_and_orientation = {
                Lenght: length, Orinetation: orientation
            };
            return;
        }
        var width = parseInt(BigInt('0x' + buffer.slice(2, 3).toString('hex')).toString(2).padStart(8, '0').split('').slice(0, 7).join(''), 2).toString(10) + " m";
        this.target_size_and_orientation = {
            Lenght: length, Orinetation: orientation, Width: width
        };
    }

    set_presence = async (buffer: Buffer, rep: number) => {
        var start = 0;

        for (var i = 0; i < rep; i++) {
            try {
                var drho = parseInt('0x' + buffer.slice(start, start + 1).toString('hex')).toString(10) + " m";
                var dtheta = (parseInt('0x' + buffer.slice(start + 1, start + 2).toString('hex')) * 0.15).toString(10) + "º";
                start += 2
                this.presence.push({ DRHO: drho, DTHETA: dtheta });
            } catch { }
        }

    }

    set_vehicle_fleet_identification = async (buffer: Buffer) => {
        var vfi = parseInt('0x' + buffer.slice(1, 2).toString('hex'));
        switch (vfi) {
            case 0: this.vehicle_fleet_identification = "Unknown";
                break;
            case 1: this.vehicle_fleet_identification = "ATC equipment maintenance";
                break;
            case 2: this.vehicle_fleet_identification = "Airport maintenance";
                break;
            case 3: this.vehicle_fleet_identification = "Fire";
                break;
            case 4: this.vehicle_fleet_identification = "Bird scarer";
                break;
            case 5: this.vehicle_fleet_identification = "Snow plough";
                break;
            case 6: this.vehicle_fleet_identification = "Runway sweeper";
                break;
            case 7: this.vehicle_fleet_identification = "Emergency";
                break;
            case 8: this.vehicle_fleet_identification = "Police";
                break;
            case 9: this.vehicle_fleet_identification = "Bus";
                break;
            case 10: this.vehicle_fleet_identification = "Tug (push/tow)";
                break;
            case 11: this.vehicle_fleet_identification = "Grass cutter";
                break;
            case 12: this.vehicle_fleet_identification = "Fuel";
                break;
            case 13: this.vehicle_fleet_identification = "Baggage";
                break;
            case 14: this.vehicle_fleet_identification = "Catering";
                break;
            case 15: this.vehicle_fleet_identification = "Aircraft maintenance";
                break;
            case 16: this.vehicle_fleet_identification = "Flyco (follow me)";
                break;
        }
    }

    set_preprogrammed_message = async (buffer: Buffer) => {
        let bits = BigInt('0x' + buffer.toString('hex')).toString(2).padStart(8, '0').split('');
        var trb = (bits[0] === '0') ? "Default" : "In Trouble";
        var msg_id = parseInt(bits.slice(1, 8).join(''), 2);
        var msg = "";
        switch (msg_id) {
            case 1: msg = "Towing aircraft";
                break;
            case 2: msg = "“Follow me” operation";
                break;
            case 3: msg = "Runway check";
                break;
            case 4: msg = "Emergency operation (fire, medical…)";
                break;
            case 5: msg = "Work in progress (maintenance, birds scarer, sweepers…)";
                break;
        }
        this.preprogrammed_message = {
            TRB: trb, MSG: msg
        }
    }

    set_standard_deviation_of_position = async (buffer: Buffer) => {
        var x_component = (parseInt('0x' + buffer.slice(0, 1).toString('hex')) * 0.25).toString(10) + " m";
        var y_component = (parseInt('0x' + buffer.slice(1, 2).toString('hex')) * 0.25).toString(10) + " m";
        var covariance = (buffer.readInt16BE() * 0.25).toString(10) + " m"
        this.standard_deviation_of_position = { X_component: x_component, Y_component: y_component, Covariance: covariance }
    }

    set_system_status = async (buffer: Buffer) => {
        const bits = BigInt('0x' + buffer.toString('hex')).toString(2).padStart(8, '0').split('');
        var nogo = ""; // Operational Release Status of the System
        switch (bits.slice(0, 2).join('')) {
            case '00': nogo = "Operational"
                break;
            case '01': nogo = "Degraded"
                break;
            case '10': nogo = "NOGO"
                break;

        }

        var ovl = (bits[2] === "0") ? "No overload" : "Overload"; // Overload indicator
        var tsv = (bits[3] === "0") ? "Valid" : "Invalid"; // Time Source Validity
        var div = (bits[4] === "0") ? "Normal Operation" : "Diversity degraded";
        var ttf = (bits[5] === "0") ? "Test Target Operative" : "Test Target Failure";


        this.system_status = { NOGO: nogo, OVL: ovl, TSV: tsv, DIV: div, TTF: ttf }

    }
}

interface DataSourceIdentifier {
    SAC: string;
    SIC: string;
}

interface TargetReportDescription {
    TYP: string;
    DCR: string;
    CHN: string;
    GBS: string;
    CRT: string;
    SIM?: string;
    TST?: string;
    RAB?: string;
    LOP?: string;
    TOT?: string;
    SPI?: string;
}

interface Mod3ACode {
    V: string;
    G: string;
    L: string;
    Mode: string;
}

interface FlightLevel {
    V: string;
    G: string;
    FlightLevel: string;
}

interface TrackStatus {
    CNF: string;
    TRE: string;
    CST: string;
    MAH: string;
    TCC: string;
    STH: string;
    TOM?: string;
    DOU?: string;
    MRS?: string;
    GHO?: string;
}

interface CalculatedAcceleration {
    Ax: number;
    Ay: number;
}

interface TargetIdentification {
    STI: string;
    TargetIdentification: string;
}

interface TargetSizeAndOrientation {
    Lenght: string;
    Orinetation?: string;
    Width?: string;
}

interface Presence {
    DRHO: string;
    DTHETA: string;
}

interface PreprogrammedMessage {
    TRB: string;
    MSG: string;
}

interface StandardDeviationOfPosition {
    X_component: string;
    Y_component: string;
    Covariance: string;
}

interface SystemStatus {
    NOGO: string;
    OVL: string;
    TSV: string;
    DIV: string;
    TTF: string;
}