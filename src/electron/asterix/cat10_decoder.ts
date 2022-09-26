export class Cat10 {
    id: number;
    message_type: string;
    //data_source_identifier:
    target_report_description: TargetReportDescription;
    mod_3A_code: Mod3ACode;
    flight_level: FlightLevel;
    time_of_day: string;
    track_number: number;
    track_status: TrackStatus;
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
        switch (bits.slice(13, 15).join()) {
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
        var mode = parseInt('0x' + buffer.toString('hex')).toString(8);

        this.mod_3A_code = { V: v, G: g, L: l, Mode: mode }
    }

    set_flight_level = async (buffer: Buffer) => {
        const bits = BigInt('0x' + buffer.toString('hex')).toString(2).padStart(2 * 8, '0').split('');
        var v = (bits[0] === "0") ? "Code validated" : "Code not validated";
        var g = (bits[1] === "0") ? "Default" : "Garbled code";
        var fl = (parseInt('0x' + buffer.toString('hex')) / 4).toString(10) + "FL";

        this.flight_level = { V: v, G: g, FlightLevel: fl }
    }

    set_time_of_day = async (buffer: Buffer) => {
        var sec = parseInt('0x' + buffer.toString('hex')) / 128;
        var date = new Date(0);
        date.setSeconds(sec);
        this.time_of_day = date.toISOString().substring(11, 19);
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

interface SystemStatus {
    NOGO: string;
    OVL: string;
    TSV: string;
    DIV: string;
    TTF: string;
}