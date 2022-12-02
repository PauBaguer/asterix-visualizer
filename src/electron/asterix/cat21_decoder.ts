export class Cat21 {
  id: number;
  class: "Cat21";
  instrument: "ADS-B";
  aircraft_operational_status: AircraftOperationalStatus;
  data_source_identifier: DataSourceIdentifier;
  service_identification: string;
  service_management: string;
  emitter_category: string;
  target_report_descriptor: TargetReportDescriptor;
  mod_3A_code: string;
  time_applicability_position: number;
  time_applicability_velocity: number;
  time_message_reception_position: number;
  time_message_reception_position_high: number;
  time_message_reception_velocity: number;
  time_message_reception_velocity_high: number;
  time_ASTERIX_report_transmission: number;
  target_address: string;
  quality_indicator: QualityIndicator;
  tarjectory_intent: TrajectoryIntent;
  wgs_84_coordinates: WGS_84_coordinates;
  wgs_84_coordinates_high: WGS_84_coordinates;
  message_amplitude: string;
  geometric_height: string;
  flight_level: string;
  selected_altitude: SelectedAltitude;
  final_state_selected_altitude: FinalStateSelectedAltitude;
  air_speed: string;
  true_airspeed: string;
  magnetic_heading: string;
  barometric_vertical_rate: string;
  geometric_vertical_rate: string;
  airborne_ground_vector: AirborneGroundVector;
  track_number: number;
  track_angle_rate: string;
  target_identification: string;
  target_status: TargetStatus;
  mops_version: MOPSv;
  met_information: MetInformation;
  roll_angle: string;
  mode_s_mb_data: string[];
  acas_resolution_advisory_report: ACAS_ResolutioinAdvisorReport;
  surface_capabilities_and_characteristics: SurfaceCapabilitiesAndCharacteristics;
  //data_ages
  receiver_ID: string;
  Aircraft_Operational_Status_age: number;
  Target_Report_Descriptor_age: number;
  Mode_3A_Code_age: number;
  Quality_Indicators_age: number;
  Trajectory_Intent_age: number;
  Message_Amplitude_age: number;
  Geometric_Height_age: number;
  Flight_Level_age: number;
  Intermediate_State_Selected_Altitude_age: number;
  Final_State_Selected_Altitude_age: number;
  Air_Speed_age: number;
  True_Air_Speed_age: number;
  Magnetic_Heading_age: number;
  Barometric_Vertical_Rate_age: number;
  Geometric_Vertical_Rate_age: number;
  Ground_Vector_age: number;
  Track_Angle_Rate_age: number;
  Target_Identification_age: number;
  Target_Status_age: number;
  Met_Information_age: number;
  Roll_Angle_age: number;
  ACAS_Resolution_Advisory_age: number;
  Surface_Capabilities_and_Characteristics_age: number;
  csv: string[];

  constructor(id: number) {
    this.id = id;
    this.class = "Cat21";
    this.instrument = "ADS-B";
    this.csv = Array(60).fill(" ");
    this.csv[0] = id.toString();
    this.csv[1] = "Cat21";
  }

  async set_aircraft_operational_status(buffer: Buffer) {
    const bits = BigInt("0x" + buffer.toString("hex"))
      .toString(2)
      .padStart(8, "0")
      .split("");
    var ra = bits[0] === "0" ? "TCAS II or ACAS RA not active" : "TCAS RA active";

    var tc = ""; // Operational Release Status of the System
    switch (bits.slice(1, 3).join("")) {
      case "00":
        tc = "No capability for Trajectory Change Reports";
        break;
      case "01":
        tc = "Support for TC+0 reports only";
        break;
      case "10":
        tc = "Support for multiple TC reports";
        break;
      case "11":
        tc = "Reserved";
        break;
    }

    var ts =
      bits[3] === "0" ? "No capability to support Target State Reports" : "Capable of supporting target State Reports"; // Time Source Validity
    var arv = bits[4] === "0" ? "No capability to generate ARV-reports" : "Capable of generate ARV-reports";
    var cdti = bits[5] === "0" ? "CDTI not operational" : "CDTI operational";
    var tcas = bits[6] === "0" ? "TCAS operational" : "TCAS not operational";
    var sa = bits[7] === "0" ? "Antenna Diversity" : "Single Antenna only";

    this.aircraft_operational_status = { RA: ra, TC: tc, TS: ts, ARV: arv, CDTI: cdti, TCAS: tcas, SA: sa };
    this.csv[27] =
      "RA: " + ra + " TC: " + tc + " TS: " + ts + " ARV: " + arv + " CDTI:" + cdti + " TCAS: " + tcas + " SA: " + sa;
  }

  async set_data_source_identifier(buffer: Buffer) {
    const sacbuf = buffer.slice(0, 1);
    var sac = sacbuf.readInt8().toString();

    if (sac === "0") {
      sac = "0, Local airport Identifier";
    }

    const sicbuf = buffer.slice(1, 2);
    const sic = sicbuf.readUInt8().toString();
    this.data_source_identifier = { SAC: sac, SIC: sic };
    this.csv[3] = "SAC: " + sac + " SIC: " + sic;
  }

  async set_service_identification(buffer: Buffer) {
    this.service_identification = "0x" + buffer.toString("hex");
    this.csv[28] = this.service_identification;
  }

  async set_service_management(buffer: Buffer) {
    this.service_management = (parseInt("0x" + buffer.slice(0, 1).toString("hex")) * 0.5).toString(10) + " s";
    this.csv[29] = this.service_management;
  }

  async set_emitter_category(buffer: Buffer) {
    switch (buffer.slice(0, 1).toString("hex")) {
      case "00":
        this.emitter_category = "No ADS-B Emitter Category Information";
        break;
      case "01":
        this.emitter_category = "Light aircraft <= 15500 lbs";
        break;
      case "02":
        this.emitter_category = "15500 lbs < small aircraft <75000 lbs";
        break;
      case "03":
        this.emitter_category = "75000 lbs < medium a/c < 300000 lbs";
        break;
      case "04":
        this.emitter_category = "High Vortex Large";
        break;
      case "05":
        this.emitter_category = "300000 lbs <= heavy aircraft";
        break;
      case "06":
        this.emitter_category = "Highly manoeuvrable (5g acceleration capability) and high speed (>400 knots cruise)";
        break;
      case "0A":
        this.emitter_category = "Rotocraft";
        break;
      case "0B":
        this.emitter_category = "Glider / sailplane";
        break;
      case "0C":
        this.emitter_category = "Lighter-than-air";
        break;
      case "0D":
        this.emitter_category = "Unmanned aerial vehicle";
        break;
      case "0E":
        this.emitter_category = "Space / transatmospheric vehicle";
        break;
      case "0F":
        this.emitter_category = "Ultralight / handglider / paraglider";
        break;
      case "10":
        this.emitter_category = "Parachutist / skydiver";
        break;
      case "14":
        this.emitter_category = "Surface emergency vehicle";
        break;
      case "15":
        this.emitter_category = "Surface service vehicle";
        break;
      case "16":
        this.emitter_category = "Fixed ground or tethered obstruction";
        break;
      case "17":
        this.emitter_category = "Cluster obstacle";
        break;
      case "18":
        this.emitter_category = "Line obstacle";
        break;
      default:
        this.emitter_category = "Reserved";
    }
    this.csv[30] = this.emitter_category;
  }

  async set_target_report_descriptor(buffer: Buffer) {
    const len = buffer.length;
    const bits = BigInt("0x" + buffer.toString("hex"))
      .toString(2)
      .padStart(len * 8, "0")
      .split("");
    var atp = "";
    switch (bits.slice(0, 3).join("")) {
      case "000":
        atp = "24-Bit ICAO address";
        break;
      case "001":
        atp = "Duplicate address";
        break;
      case "010":
        atp = "Surface vehicle address";
        break;
      case "011":
        atp = "Anonymous address";
        break;
      default:
        atp = "Reserved for future use";
    }

    var arc = "";
    switch (bits.slice(3, 5).join("")) {
      case "00":
        arc = "25 ft";
        break;
      case "01":
        arc = "100 ft";
        break;
      case "10":
        arc = "Unknown";
        break;
      case "11":
        arc = "Invalid";
        break;
    }

    var rc = bits[5] === "0" ? "Default" : "Range Check passed, CPR Validation pending";
    var rab = bits[6] === "0" ? "Report from target transponder" : "Report from field monitor (fixed transponder)";

    if (len === 1) {
      this.target_report_descriptor = { ATP: atp, ARC: arc, RC: rc, RAB: rab };
      this.csv[31] = "ATP: " + atp + " ARC: " + arc + " RC: " + rc + " RAB: " + rab;
      return;
    }

    var dcr = bits[8] === "0" ? "No differential correction (ADS-B)" : "Differential correction (ADS-B)";
    var gbs = bits[9] === "0" ? "Ground Bit not set" : "Ground Bit set";
    var sim = bits[10] === "0" ? "Actual target report" : "Actual target report";
    var tst = bits[11] === "0" ? "Default" : "Test Target";
    var saa =
      bits[12] === "0"
        ? "Equipment capable to provide Selected Altitude"
        : "Equipment not capable to provide Selected Altitude";

    var cl = "";
    switch (bits.slice(13, 15).join("")) {
      case "00":
        cl = "Report valid";
        break;
      case "01":
        cl = "Report suspect";
        break;
      case "10":
        cl = "No information";
        break;
      case "11":
        cl = "Reserved for future use";
        break;
    }

    if (len === 2) {
      this.target_report_descriptor = {
        ATP: atp,
        ARC: arc,
        RC: rc,
        RAB: rab,
        DCR: dcr,
        GBS: gbs,
        SIM: sim,
        TST: tst,
        SAA: saa,
        CL: cl,
      };
      this.csv[31] =
        "ATP: " +
        atp +
        " ARC: " +
        arc +
        " RC: " +
        rc +
        " RAB: " +
        rab +
        " DCR: " +
        dcr +
        " GBS: " +
        gbs +
        " SIM: " +
        sim +
        " TST: " +
        tst +
        " SAA: " +
        saa +
        " CL: " +
        cl;

      return;
    }

    var ipc = bits[18] === "0" ? "Default" : "Independent Position Check failed";
    var nogo = bits[19] === "0" ? "NOGO-bit not set" : "NOGO-bit set";
    var cpr = bits[20] === "0" ? "CPR Validation correct" : "CPR Validation failed";
    var ldpj = bits[21] === "0" ? "LDPJ not detected" : "LDPJ detected";
    var rcf = bits[22] === "0" ? "Default" : "Range Check failed";

    this.target_report_descriptor = {
      ATP: atp,
      ARC: arc,
      RC: rc,
      RAB: rab,
      DCR: dcr,
      GBS: gbs,
      SIM: sim,
      TST: tst,
      SAA: saa,
      CL: cl,
      IPC: ipc,
      NOGO: nogo,
      CPR: cpr,
      LDPJ: ldpj,
      RCF: rcf,
    };

    this.csv[31] =
      "ATP: " +
      atp +
      " ARC: " +
      arc +
      " RC: " +
      rc +
      " RAB: " +
      rab +
      " DCR: " +
      dcr +
      " GBS: " +
      gbs +
      " SIM: " +
      sim +
      " TST: " +
      tst +
      " SAA: " +
      saa +
      " CL: " +
      cl +
      " IPC: " +
      ipc +
      " NOGO: " +
      nogo +
      " CPR: " +
      cpr +
      " LDPJ: " +
      ldpj +
      " RCF: " +
      rcf;
  }

  async set_mod_3A_code(buffer: Buffer) {
    this.mod_3A_code = parseInt("0x" + buffer.toString("hex"))
      .toString(8)
      .padStart(4, "0");
    this.csv[10] = this.mod_3A_code;
  }

  async set_time_applicability_position(buffer: Buffer) {
    this.time_applicability_position = Math.round((parseInt("0x" + buffer.toString("hex")) / 128.0) * 10) / 10;
    this.csv[32] = this.time_applicability_position.toString();
  }

  async set_time_applicability_velocity(buffer: Buffer) {
    this.time_applicability_velocity = Math.round((parseInt("0x" + buffer.toString("hex")) / 128.0) * 10) / 10;
    this.csv[33] = this.time_applicability_velocity.toString();
  }

  async set_time_message_reception_position(buffer: Buffer) {
    this.time_message_reception_position = Math.round((parseInt("0x" + buffer.toString("hex")) / 128.0) * 10) / 10;
    this.csv[34] = this.time_message_reception_position.toString();
  }

  async set_time_message_reception_position_high(buffer: Buffer) {
    //TODO check if its correct
    const bits = BigInt("0x" + buffer.toString("hex"))
      .toString(2)
      .padStart(4 * 8, "0")
      .split("");
    var fsi = 0;
    if (bits.slice(0, 2).join("") == "01") {
      fsi = +1;
    } else if (bits.slice(0, 2).join("") == "10") {
      fsi = -1;
    }

    this.time_message_reception_position_high =
      (parseInt("0x" + buffer.toString("hex")) + fsi) * Math.pow(2, -30) * Math.pow(2, 9); //[ns]
    this.csv[35] = this.time_message_reception_position_high.toString();
  }

  async set_time_message_reception_velocity(buffer: Buffer) {
    this.time_message_reception_velocity = Math.round((parseInt("0x" + buffer.toString("hex")) / 128.0) * 10) / 10;
    this.csv[36] = this.time_message_reception_velocity.toString();
  }

  async set_time_message_reception_velocity_high(buffer: Buffer) {
    const bits = BigInt("0x" + buffer.toString("hex"))
      .toString(2)
      .padStart(4 * 8, "0")
      .split("");
    var fsi = 0;
    if (bits.slice(0, 2).join("") == "01") {
      fsi = +1;
    } else if (bits.slice(0, 2).join("") == "10") {
      fsi = -1;
    }

    this.time_message_reception_velocity_high =
      (parseInt("0x" + buffer.toString("hex")) + fsi) * Math.pow(2, -30) * Math.pow(2, 9); //[ns]
    this.csv[37] = this.time_message_reception_velocity_high.toString();
  }

  async set_time_ASTERIX_report_transmission(buffer: Buffer) {
    this.time_ASTERIX_report_transmission = Math.round((parseInt("0x" + buffer.toString("hex")) / 128.0) * 10) / 10;
    this.csv[38] = this.time_ASTERIX_report_transmission.toString();
  }

  async set_target_address(buffer: Buffer) {
    this.target_address = "0x" + buffer.toString("hex");
    this.csv[18] = this.target_address;
  }

  async set_quality_indicator(buffer: Buffer) {
    const bits = BigInt("0x" + buffer.toString("hex"))
      .toString(2)
      .padStart(buffer.length * 8, "0")
      .split("");
    var nucr_or_nacv = "";
    switch (bits.slice(0, 3).join("")) {
      case "000":
        nucr_or_nacv = "Horizontal Velocity Error >= 10 m/s";
        break;
      case "001":
        nucr_or_nacv = "Horizontal Velocity Error < 10 m/s";
        break;
      case "010":
        nucr_or_nacv = "Horizontal Velocity Error < 3 m/s";
        break;
      case "011":
        nucr_or_nacv = "Horizontal Velocity Error < 1 m/s";
        break;
      case "100":
        nucr_or_nacv = "Horizontal Velocity Error < 0.3 m/s";
        break;
    }

    var nucp_or_nic = "";
    switch (bits.slice(3, 7).join("")) {
      case "0000":
        nucp_or_nic = "Radius of Containment unknown";
        break;
      case "0001":
        nucp_or_nic = "Radius of Containment < 20 NM (37.04 km)";
        break;
      case "0010":
        nucp_or_nic = "Radius of Containment < 8 NM (14.816 km)";
        break;
      case "0011":
        nucp_or_nic = "Radius of Containment < 4 NM (7.408 km)";
        break;
      case "0100":
        nucp_or_nic = "Radius of Containment < 2 NM (3.704 km)";
        break;
      case "0101":
        nucp_or_nic = "Radius of Containment < 1 NM (1852 m)";
        break;
      case "0110":
        nucp_or_nic = "Radius of Containment < 0.6 NM (1111.2 m)";
        break;
      case "0111":
        nucp_or_nic = "Radius of Containment < 0.2 NM (370.4 m)";
        break;
      case "1000":
        nucp_or_nic = "Radius of Containment < 0.1 NM (185.2 m)";
        break;
      case "1001":
        nucp_or_nic = "Radius of Containment < 75 m";
        break;
      case "1010":
        nucp_or_nic = "Radius of Containment < 25 m";
        break;
      case "1011":
        nucp_or_nic = "Radius of Containment < 7.5 m";
        break;
      default:
        nucp_or_nic = "Reserved";
        break;
    }

    if (bits[7] == "0") {
      this.quality_indicator = { NUCr_or_NACv: nucr_or_nacv, NUCp_or_NIC: nucp_or_nic };
      this.csv[39] = "NUCr_or_NACv: " + nucr_or_nacv + " NUCp_or_NIC: " + nucp_or_nic;
      return;
    }

    const nicbaro = "0x" + parseInt(bits.slice(8, 9).join("").toString(), 2).toString(16).padStart(2, "0");
    var sil = "";
    switch (bits.slice(9, 11).join("")) {
      case "00":
        sil = "Unknown or > 1 x 10^-3 per flight hour or per sample";
        break;
      case "01":
        sil = "<= 1 x 10^-3 per flight hour or per sample";
        break;
      case "10":
        sil = "<= 1 x 10^-5 per flight hour or per sample";
        break;
      case "11":
        sil = "<= 1 x 10^-7 per flight hour or per sample";
        break;
    }

    let nacp = "";
    switch (bits.slice(11, 15).join("")) {
      case "0000":
        nacp = "EPU >= 18.52 km (>= 10 NM) 'Unknown accuracy'";
        break;
      case "0001":
        nacp = "EPU < 18.52 km (10 NM) 'RNP-10 accuracy'";
        break;
      case "0010":
        nacp = "EPU < 7.408 km (4 NM) 'RNP-4 accuracy'";
        break;
      case "0011":
        nacp = "EPU < 3.704 km (2 NM) 'RNP-2 accuracy'";
        break;
      case "0100":
        nacp = "EPU < 1852 m (1 NM) 'RNP-1 accuracy'";
        break;
      case "0101":
        nacp = "EPU < 926 m (0.5 NM) 'RNP-0.5 accuracy'";
        break;
      case "0110":
        nacp = "EPU < 555.6 m (0.3 NM) 'RNP-0.3 accuracy'";
        break;
      case "0111":
        nacp = "EPU < 185.2 m (0.1 NM) 'RNP-0.1 accuracy'";
        break;
      case "1000":
        nacp = "EPU < 92.6 m (0.05 NM) 'e.g., GPS (with SA on)'";
        break;
      case "1001":
        nacp = "EPU < 30 m 'e.g., GPS (SA off)'";
        break;
      case "1010":
        nacp = "EPU < 10 m 'e.g., WAAS'";
        break;
      case "1011":
        nacp = "EPU < 3 m 'e.g., LAAS'";
        break;
      default:
        nacp = "Reserved";
        break;
    }
    if (bits[15] == "0") {
      this.quality_indicator = {
        NUCr_or_NACv: nucr_or_nacv,
        NUCp_or_NIC: nucp_or_nic,
        NICBARO: nicbaro,
        SIL: sil,
        NACp: nacp,
      };
      this.csv[39] =
        "NUCr_or_NACv: " +
        nucr_or_nacv +
        " NUCp_or_NIC: " +
        nucp_or_nic +
        " NICBARO: " +
        nicbaro +
        " SIL: " +
        sil +
        " NACP: " +
        nacp;
      return;
    }

    const sil_s = bits[18] == "0" ? "measured per flight-hour" : "measured per sample";

    var sda = "";
    switch (bits.slice(19, 21).join("")) {
      case "00":
        sda =
          "Supported Failure Conditions: Unknown/No safety effect \nProbability of Undetected Fault: > 1 x 10^-3 per flight hour or Unknown \nSoftware & Hardware Design Assurance Level: N/A";
        break;
      case "01":
        sda =
          "Supported Failure Conditions: Minor \nProbability of Undetected Fault: <= 1 x 10^-3 per flight hour \nSoftware & Hardware Design Assurance Level: D";
        break;
      case "10":
        sda =
          "Supported Failure Conditions: Major \nProbability of Undetected Fault: > 1 x 10^-5 per flight hour \nSoftware & Hardware Design Assurance Level: C";
        break;
      case "11":
        sda =
          "Supported Failure Conditions: Hazardous \nProbability of Undetected Fault: > 1 x 10^-7 per flight hour \nSoftware & Hardware Design Assurance Level: B";
        break;
    }
    var gva = "";
    switch (bits.slice(21, 23).join("")) {
      case "00":
        gva = "Unknown or > 150 meters";
        break;
      case "01":
        gva = "<= 150 meters";
        break;
      case "10":
        gva = "<= 45 meters";
        break;
      case "11":
        gva = "Reserved";
        break;
    }
    if (bits[23] == "0") {
      this.quality_indicator = {
        NUCr_or_NACv: nucr_or_nacv,
        NUCp_or_NIC: nucp_or_nic,
        NICBARO: nicbaro,
        SIL: sil,
        NACp: nacp,
        SILsupplement: sil_s,
        SDA: sda,
        GVA: gva,
      };
      this.csv[39] =
        "NUCr_or_NACv: " +
        nucr_or_nacv +
        " NUCp_or_NIC: " +
        nucp_or_nic +
        " NICBARO: " +
        nicbaro +
        " SIL: " +
        sil +
        " NACP: " +
        nacp +
        " SILsupplement: " +
        sil_s +
        " GVA: " +
        gva;
      return;
    }

    let pic = "";
    switch (bits.slice(24, 28).join("")) {
      case "0000":
        pic = "No integrity (or > 20.0 NM)";
        break;
      case "0001":
        pic = "< 20.0 NM";
        break;
      case "0010":
        pic = "< 10.0 NM";
        break;
      case "0011":
        pic = "< 8.0 NM";
        break;
      case "0100":
        pic = "< 4.0 NM";
        break;
      case "0101":
        pic = "< 2.0 NM";
        break;
      case "0110":
        pic = "< 1.0 NM";
        break;
      case "0111":
        pic = "< 0.6 NM";
        break;
      case "1000":
        pic = "< 0.5 NM";
        break;
      case "1001":
        pic = "< 0.3 NM";
        break;
      case "1010":
        pic = "< 0.2 NM";
        break;
      case "1011":
        pic = "< 0.1 NM";
        break;
      case "1100":
        pic = "< 0.04 NM";
        break;
      case "1101":
        pic = "< 0.013 NM";
        break;
      case "1110":
        pic = "< 0.004 NM";
        break;
      case "1111":
        pic = "Not defined";
        break;
    }
    this.quality_indicator = {
      NUCr_or_NACv: nucr_or_nacv,
      NUCp_or_NIC: nucp_or_nic,
      NICBARO: nicbaro,
      SIL: sil,
      NACp: nacp,
      SILsupplement: sil_s,
      SDA: sda,
      GVA: gva,
      PIC: pic,
    };
    this.csv[39] =
      "NUCr_or_NACv: " +
      nucr_or_nacv +
      " NUCp_or_NIC: " +
      nucp_or_nic +
      " NICBARO: " +
      nicbaro +
      " SIL: " +
      sil +
      " NACP: " +
      nacp +
      " SILsupplement: " +
      sil_s +
      " GVA: " +
      gva +
      " PIC: " +
      pic;
  }

  async set_trajectory_intent(buffer: Buffer, tis: boolean, tid: boolean, rep: number) {
    var nav = "";
    var nvb = "";
    var offset = 0;
    if (tis) {
      const bits = BigInt("0x" + buffer.slice(0, 1).toString("hex"))
        .toString(2)
        .padStart(8, "0")
        .split("");
      nav =
        bits[0] === "0"
          ? "Trajectory Intent Data is  available for this aircraft"
          : "Trajectory Intent Data is not available for this aircraft";
      nvb = bits[0] === "0" ? "Trajectory Intent Data is valid" : "Trajectory Intent Data is not valid";
      if (!tid) {
        this.tarjectory_intent = { TIS: tis, NAV: nav, NVB: nvb, TID: tid };
        this.csv[40] = "TIS: " + tis + " NAV: " + nav + " NVB: " + nvb + " TID: " + tid;
        return;
      }
      offset++;
    }
    if (tid) {
      offset++;
      var vec = [];
      for (var i = 0; i < rep; i++) {
        const octet1 = BigInt("0x" + buffer.slice(offset, offset + 1).toString("hex"))
          .toString(2)
          .padStart(8, "0")
          .split("");
        const tca = octet1[0] === "0" ? "TCP number available" : "TCP number not available";
        const nc = octet1[1] === "0" ? "TCP compliance" : "TCP non-compliance";
        const tcp = parseInt(octet1.slice(2, 7).join(""), 2).toString(10);

        const altitude = (buffer.slice(offset + 1, offset + 3).readInt16BE() * 10).toString(10) + " ft";

        const latitude = (buffer.readIntBE(offset + 3, offset + 6) * 180) / Math.pow(2, 23) + "deg";
        const longitude = (buffer.readIntBE(offset + 6, offset + 9) * 180) / Math.pow(2, 23) + "deg";

        const octet11 = BigInt("0x" + buffer.slice(offset + 9, offset + 10).toString("hex"))
          .toString(2)
          .padStart(8, "0")
          .split("");
        var pt = "";
        switch (octet11.slice(0, 4).join("")) {
          case "0000":
            pt = "Unknown";
            break;
          case "0001":
            pt = "Fly by waypoint (LT)";
            break;
          case "0010":
            pt = "Fly over waypoint (LT)";
            break;
          case "0011":
            pt = "Hold pattern (LT)";
            break;
          case "0100":
            pt = "Procedure hold (LT)";
            break;
          case "0101":
            pt = "Procedure turn (LT)";
            break;
          case "0110":
            pt = "RF leg (LT)";
            break;
          case "0111":
            pt = "Top of climb (VT)";
            break;
          case "1000":
            pt = "Top of descent (VT)";
            break;
          case "1001":
            pt = "Start of level (VT)";
            break;
          case "1010":
            pt = "Cross-over altitude (VT)";
            break;
          case "1011":
            pt = "Transition altitude (VT)";
            break;
        }
        var td = "";
        switch (octet11.slice(4, 6).join("")) {
          case "00":
            td = "N/A";
            break;
          case "01":
            td = "Turn right";
            break;
          case "10":
            td = "Turn left";
            break;
          case "11":
            td = "No turn";
            break;
        }
        var tra = octet11[6] === "0" ? "TTR not available" : "TTR available";
        var toa = octet11[7] === "0" ? "TOV available" : "TOV not available";
        const tov = parseInt("0x" + buffer.slice(offset + 10, offset + 13).toString("hex")).toString(10) + " s";
        const ttr = parseInt("0x" + buffer.slice(offset + 13, offset + 15).toString("hex")).toString(10) + " s";
        offset += 15;
        vec.push({
          TCA: tca,
          NC: nc,
          TCPnumber: tcp,
          Altitude: altitude,
          Latitude: latitude,
          Longitud: longitude,
          PointType: pt,
          TD: td,
          TRA: tra,
          TOA: toa,
          TOV: tov,
          TTR: ttr,
        });
      }
      if (!tis) {
        this.tarjectory_intent = { TIS: tis, TID: tid, TIDvec: vec };
        this.csv[40] = "TIS: " + tis + " TID: " + tid;
        return;
      } else {
        this.tarjectory_intent = { TIS: tis, NAV: nav, NVB: nvb, TID: tid, TIDvec: vec };
        this.csv[40] = "TIS: " + tis + " NAV: " + nav + " NVB: " + nvb + " TID: " + tid;
      }
    }
  }

  async set_wgs_84_coordinates(buffer: Buffer) {
    const lat_buffer = buffer.slice(0, 3);
    const lon_buffer = buffer.slice(3, 6);

    const str_lat = BigInt("0x" + lat_buffer.toString("hex"))
      .toString(2)
      .padStart(24, "0");

    const str_lon = BigInt("0x" + lon_buffer.toString("hex"))
      .toString(2)
      .padStart(24, "0");
    const lat = (fromTwosComplement(str_lat) * 180) / Math.pow(2, 23);
    const lon = (fromTwosComplement(str_lon) * 180) / Math.pow(2, 23);

    this.wgs_84_coordinates = {
      latitude: lat,
      longitude: lon,
    };
    this.csv[5] = "Latitude: " + lat + " Longitude: " + lon;
  }

  async set_wgs_84_coordinates_high(buffer: Buffer) {
    try {
      const lat_buffer = buffer.slice(0, 4);
      const lon_buffer = buffer.slice(4, 8);
      const lat = (lat_buffer.readInt32BE() * 180) / Math.pow(2, 30);
      const lon = (lon_buffer.readInt32BE() * 180) / Math.pow(2, 30);
      this.wgs_84_coordinates_high = {
        latitude: lat,
        longitude: lon,
      };
      this.csv[41] = "Latitude: " + lat + " Longitude: " + lon;
    } catch (e) {
      if (e instanceof RangeError) {
        // Output expected ERR_BUFFER_OUT_OF_BOUNDS RangeErrors.
        console.error(e);
      } else {
        // Output unexpected Errors.
        console.error(e, false);
      }
    }
  }

  async set_message_amplitude(buffer: Buffer) {
    this.message_amplitude = buffer.readIntBE(0, 1).toString(10) + " dBm";
    this.csv[42] = this.message_amplitude;
  }

  async set_geometric_height(buffer: Buffer) {
    this.geometric_height = (buffer.readIntBE(0, 2) * 6.25).toString(10) + " ft";
    this.csv[43] = this.geometric_height;
  }

  async set_flight_level(buffer: Buffer) {
    this.flight_level = "FL" + (buffer.readIntBE(0, 2) / 4).toString(10);
    this.csv[11] = this.flight_level;
  }

  async set_selected_altitude(buffer: Buffer) {
    const bits = BigInt("0x" + buffer.toString("hex"))
      .toString(2)
      .padStart(2 * 8, "0")
      .split("");
    const sas = bits[0] === "0" ? "No source information provided" : "Source Information provided";
    var source = "";
    switch (bits.slice(1, 3).join("")) {
      case "00":
        source = "Unknown";
        break;
      case "01":
        source = "Aircraft Altitude (Holding Altitude)";
        break;
      case "10":
        source = "MCP/FCU Selected Altitude";
        break;
      case "11":
        source = "FMS Selected Altitude";
        break;
    }
    const altitude = (fromTwosComplement(bits.slice(3, 16).join("")) * 25).toString(10) + " fl";
    this.selected_altitude = { SAS: sas, Source: source, Altitude: altitude };
    this.csv[44] = "SAS: " + sas + " Source: " + source + " Altitude: " + altitude;
  }

  async set_final_state_selected_altitude(buffer: Buffer) {
    const bits = BigInt("0x" + buffer.toString("hex"))
      .toString(2)
      .padStart(2 * 8, "0")
      .split("");
    const mv = bits[0] === "0" ? "Not active or unknown" : "Active";
    const ah = bits[1] === "0" ? "Not active or unknown" : "Active";
    const am = bits[2] === "0" ? "Not active or unknown" : "Active";

    const altitude = (fromTwosComplement(bits.slice(3, 16).join("")) * 25).toString(10) + " fl";
    this.final_state_selected_altitude = { MV: mv, AH: ah, AM: am, Altitude: altitude };
    this.csv[45] = "MV: " + mv + " AH: " + ah + " AM: " + am + " Altitude: " + altitude;
  }

  async set_air_speed(buffer: Buffer) {
    const bits = BigInt("0x" + buffer.toString("hex"))
      .toString(2)
      .padStart(2 * 8, "0")
      .split("");
    const speed = parseInt(bits.slice(1, 16).join(""), 2);
    this.air_speed =
      bits[0] === "0"
        ? "IAS: " + (speed * Math.pow(2, -14)).toString(10) + " NM/s"
        : "Mach: " + (speed * 0.001).toString(10);
    this.csv[46] = this.air_speed;
  }

  async set_true_airspeed(buffer: Buffer) {
    const bits = BigInt("0x" + buffer.toString("hex"))
      .toString(2)
      .padStart(8, "0")
      .split("");
    this.true_airspeed =
      bits[0] === "0" ? parseInt(bits.slice(1, 16).join(""), 2).toString(10) + " knot" : "Value exceeds defined range";
    this.csv[47] = this.true_airspeed;
  }

  async set_magnetic_heading(buffer: Buffer) {
    this.magnetic_heading = ((parseInt("0x" + buffer.toString("hex")) * 360) / Math.pow(2, 16)).toString(10) + " deg";
    this.csv[48] = this.magnetic_heading;
  }

  async set_barometric_vertical_rate(buffer: Buffer) {
    const bits = BigInt("0x" + buffer.toString("hex"))
      .toString(2)
      .padStart(2 * 8, "0")
      .split("");
    this.barometric_vertical_rate =
      bits[0] === "0"
        ? (fromTwosComplement(bits.slice(1, 16).join("")) * 6.25).toString(10) + " feet/minute"
        : "Value exceeds defined range";
    this.csv[49] = this.barometric_vertical_rate;
  }

  async set_geometric_vertical_rate(buffer: Buffer) {
    const bits = BigInt("0x" + buffer.toString("hex"))
      .toString(2)
      .padStart(2 * 8, "0")
      .split("");
    this.geometric_vertical_rate =
      bits[0] === "0"
        ? (fromTwosComplement(bits.slice(1, 16).join("")) * 6.25).toString(10) + " feet/minute"
        : "Value exceeds defined range";
    this.csv[50] = this.geometric_vertical_rate;
  }

  async set_airborne_ground_vector(buffer: Buffer) {
    const bits = BigInt("0x" + buffer.slice(0, 2).toString("hex"))
      .toString(2)
      .padStart(2 * 8, "0")
      .split("");
    const gs =
      bits[0] === "0"
        ? parseInt(bits.slice(1, 16).join("").toString(), 2) * Math.pow(2, -14) + " nmi/s"
        : "Value exceeds defined range";
    const ta = (parseInt("0x" + buffer.slice(2, 4).toString("hex")) * 360) / Math.pow(2, 16) + " deg";
    this.airborne_ground_vector = { GroundSpeed: gs, TrackAngle: ta };
    this.csv[51] = "GroundSpeed: " + gs + " TrackAngle: " + ta;
  }

  async set_track_number(buffer: Buffer) {
    this.track_number = parseInt("0x" + buffer.toString("hex"));
    this.csv[15] = this.track_number.toString();
  }

  async set_track_angle_rate(buffer: Buffer) {
    this.track_angle_rate =
      (
        fromTwosComplement(
          BigInt("0x" + buffer.slice(0, 2).toString("hex"))
            .toString(2)
            .padStart(10, "0")
        ) / 32
      ).toString(10) + " deg/s";
    this.csv[52] = this.track_angle_rate.toString();
  }

  async set_target_identification(buffer: Buffer) {
    const bits = BigInt("0x" + buffer.toString("hex"))
      .toString(2)
      .padStart(6 * 8, "0")
      .split("");

    var target_identification = [];
    var start = 0;
    for (var i = 0; i < 8; i++) {
      target_identification.push(this.ti_parse(bits.slice(start, start + 6)));
      start += 6;
    }

    this.target_identification = target_identification.join("");
    this.csv[19] = target_identification.join("");
  }

  ti_parse(bits: string[]) {
    var res = "";
    var slice = bits.slice(0, 2).join("");
    if (slice === "11") {
      return parseInt(bits.slice(2, 6).join(""), 2).toString(10);
    }
    switch (bits.slice(2, 6).join("")) {
      case "0000":
        slice === "01" ? (res = "P") : (res = " ");
        break;
      case "0001":
        slice === "00" ? (res = "A") : (res = "Q");
        break;
      case "0010":
        slice === "00" ? (res = "B") : (res = "R");
        break;
      case "0011":
        slice === "00" ? (res = "C") : (res = "S");
        break;
      case "0100":
        slice === "00" ? (res = "D") : (res = "T");
        break;
      case "0101":
        slice === "00" ? (res = "E") : (res = "U");
        break;
      case "0110":
        slice === "00" ? (res = "F") : (res = "V");
        break;
      case "0111":
        slice === "00" ? (res = "G") : (res = "W");
        break;
      case "1000":
        slice === "00" ? (res = "H") : (res = "X");
        break;
      case "1001":
        slice === "00" ? (res = "I") : (res = "Y");
        break;
      case "1010":
        slice === "00" ? (res = "J") : (res = "Z");
        break;
      case "1011":
        res = "K";
        break;
      case "1100":
        res = "L";
        break;
      case "1101":
        res = "M";
        break;
      case "1110":
        res = "N";
        break;
      case "1111":
        res = "O";
        break;
    }
    return res;
  }

  async set_target_status(buffer: Buffer) {
    const bits = BigInt("0x" + buffer.toString("hex"))
      .toString(2)
      .padStart(8, "0")
      .split("");
    const icf = bits[0] === "0" ? "No intent change active" : "Intent change flag raised";
    const lnav = bits[1] === "0" ? "LNAV Mode engaged" : "LNAV Mode not engaged";
    var ps = "";
    switch (bits.slice(3, 6).join("")) {
      case "000":
        ps = "No emergency / not reported";
        break;
      case "001":
        ps = "General emergency";
        break;
      case "010":
        ps = "Lifeguard / medical emergency";
        break;
      case "011":
        ps = "Minimum fuel";
        break;
      case "100":
        ps = "No communications";
        break;
      case "101":
        ps = "Unlawful interference";
        break;
      case "110":
        ps = "“Downed” Aircraft";
        break;
    }

    var ss = "";
    switch (bits.slice(6, 8).join("")) {
      case "00":
        ss = "No condition reported";
        break;
      case "01":
        ss = "Permanent Alert (Emergency condition)";
        break;
      case "10":
        ss = "Temporary Alert (change in Mode 3/A Code other than emergency)";
        break;
      case "11":
        ss = "SPI set";
        break;
    }

    this.target_status = { ICF: icf, LNAV: lnav, PS: ps, SS: ss };
    this.csv[53] = "ICF: " + icf + " LNAV: " + lnav + " PS: " + ps + " SS: " + ss;
  }

  async set_mops_version(buffer: Buffer) {
    // TODO check Version Number
    const bits = BigInt("0x" + buffer.toString("hex"))
      .toString(2)
      .padStart(8, "0")
      .split("");
    const vns =
      bits[1] === "0" ? "The MOPS Version is supported by the GS" : "The MOPS Version is not supported by the GS";
    var vn = "";
    switch (bits.slice(2, 5).join("")) {
      case "000":
        vn = "ED102/DO-260";
        break;
      case "001":
        vn = "DO-260A";
        break;
      case "010":
        vn = "ED102A/DO-260B";
        break;
    }
    var ltt = "";
    switch (bits.slice(5, 8).join("")) {
      case "000":
        ltt = "Other";
        break;
      case "001":
        ltt = "UAT";
        break;
      case "010":
        ltt = "1090 ES";
        break;
      case "011":
        ltt = "VDL 4";
        break;
      default:
        ltt = "Not assigned";
    }
    this.mops_version = { VNS: vns, VN: vn, LTT: ltt };
    this.csv[54] = "VNS: " + vns + " VN: " + vn + " LTT: " + ltt;
  }

  async set_met_information(buffer: Buffer, fields: string[]) {
    var ws = "Absence";
    var wd = "Absence";
    var tmp = "Absence";
    var trb = "Absence";
    let offset = 0;
    fields.forEach((value) => {
      switch (value) {
        case "WS":
          {
            ws = parseInt("0x" + buffer.slice(offset, offset + 2).toString("hex")).toString(10) + " knot";
            offset += 2;
          }
          break;
        case "WD":
          {
            wd = parseInt("0x" + buffer.slice(offset, offset + 2).toString("hex")).toString(10) + " deg";
            offset += 2;
          }
          break;
        case "TMP":
          {
            tmp = (buffer.readIntBE(0, 2) * 0.25).toString(10) + " C";
            offset += 2;
          }
          break;
        case "TRB":
          trb = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")).toString(10);
          break;
      }
    });
    this.met_information = { WS: ws, WD: wd, TMP: tmp, TRB: trb };
    this.csv[55] = "WS: " + ws + " WD: " + wd + " TMP: " + tmp + " TRB: " + trb;
  }

  async set_roll_angle(buffer: Buffer) {
    this.roll_angle = (buffer.readIntBE(0, 2) * 0.01).toString(10) + " deg";
    this.csv[56] = this.roll_angle;
  }

  async set_mode_s_mb_data(buffer: Buffer, rep: number) {
    var start = 0;

    for (var i = 0; i < rep; i++) {
      try {
        var bits = BigInt("0x" + buffer.slice(start, start + 9).toString("hex"))
          .toString(2)
          .padStart(9 * 8, "0")
          .split("");
        var data = bits.slice(0, 8 * 7).join("");
        var add1 = bits.slice(8 * 7, 8 * 7 + 4).join("");
        var add2 = bits.slice(8 * 7 + 4, 8 * 7 + 8).join("");
        this.mode_s_mb_data.push("BDS1: 0x" + add1 + " BDS2: 0x" + add2 + " MB Data: 0x" + data);
        start += 8;
      } catch {}
    }
    this.csv[20] = this.mode_s_mb_data.join(" / ");
  }

  async set_acas_resolution_advisory_report(buffer: Buffer) {
    var bits = BigInt("0x" + buffer.slice(0, 1).toString("hex"))
      .toString(2)
      .padStart(7 * 8, "0")
      .split("");
    this.acas_resolution_advisory_report = {
      TYP: bits.slice(0, 5).join(""),
      STYP: bits.slice(5, 8).join(""),
      ARA: bits.slice(8, 16).join(""),
      RAC: bits.slice(16, 26).join(""),
      RAT: bits[26],
      MTE: bits[27],
      TTI: bits.slice(28, 30).join(""),
      TID: bits.slice(30).join(""),
    };
    this.csv[57] =
      "TYP: " +
      bits.slice(0, 5).join("") +
      " STYP: " +
      bits.slice(5, 8).join("") +
      " ARA: " +
      bits.slice(8, 16).join("") +
      " RAC: " +
      bits.slice(16, 26).join("") +
      " RAT: " +
      bits[26] +
      " MTE: " +
      bits[27] +
      " TTI: " +
      bits.slice(28, 30).join("") +
      " TID: " +
      bits.slice(30).join("");
  }

  async set_surface_capabilities_and_characteristics(buffer: Buffer) {
    var bits = BigInt("0x" + buffer.slice(0, 1).toString("hex"))
      .toString(2)
      .padStart(8, "0")
      .split("");
    var poa =
      bits[2] === "0"
        ? "Position transmitted is not ADS-B position reference point"
        : "Position transmitted is the ADS-B position reference point";
    var cdti = bits[3] === "0" ? "CDTI not operational" : "CDTI operational";
    var b2 = bits[4] === "0" ? "0 >= 70 Watts" : "< 70 Watts";
    var ras = bits[5] === "0" ? "Aircraft not receiving ATC-services" : "Aircraft receiving ATC services";
    var ident = bits[6] === "0" ? "IDENT switch not active" : "IDENT switch active";

    if (bits[7] === "0") {
      this.surface_capabilities_and_characteristics = { POA: poa, CDTI: cdti, B2low: b2, RAS: ras, IDENT: ident };
      this.csv[58] = "POA: " + poa + " CDTI: " + cdti + " B2low: " + b2 + " RAS: " + ras + " IDENT: " + ident;
      return;
    }

    var lw = "";
    switch (
      BigInt("0x" + buffer.slice(1, 2).toString("hex"))
        .toString(2)
        .padStart(8, "0")
        .split("")
        .slice(4, 8)
        .join("")
    ) {
      case "0000":
        lw = "L < 15   W < 11.5";
        break;
      case "0001":
        lw = "L < 15   W < 23";
        break;
      case "0010":
        lw = "L < 25   W < 28.5";
        break;
      case "0011":
        lw = "L < 25   W < 34";
        break;
      case "0100":
        lw = "L < 35   W < 33";
        break;
      case "0101":
        lw = "L < 35   W < 38";
        break;
      case "0110":
        lw = "L < 45   W < 39.5";
        break;
      case "0111":
        lw = "L < 45   W < 45";
        break;
      case "1000":
        lw = "L < 55   W < 45";
        break;
      case "1001":
        lw = "L < 55   W < 52";
        break;
      case "1010":
        lw = "L < 65   W < 59.5";
        break;
      case "1011":
        lw = "L < 65   W < 67";
        break;
      case "1100":
        lw = "L < 75   W < 72.5";
        break;
      case "1101":
        lw = "L < 75   W < 80";
        break;
      case "1110":
        lw = "L < 85   W < 80";
        break;
      case "1111":
        lw = "L < 85   W < 80";
        break;
    }
    this.surface_capabilities_and_characteristics = { POA: poa, CDTI: cdti, B2low: b2, RAS: ras, IDENT: ident, LW: lw };
    this.csv[58] =
      "POA: " + poa + " CDTI: " + cdti + " B2low: " + b2 + " RAS: " + ras + " IDENT: " + ident + " LW: " + lw;
  }

  async set_data_ages(buffer: Buffer) {
    const items = BigInt("0x" + buffer.slice(0, 4).toString("hex"))
      .toString(2)
      .padStart(4 * 8, "0")
      .split("");

    let count = 7;
    let found = false;
    let offset = items.filter((value, index) => {
      if (index == count && !found) {
        if (value != "1") {
          found = true;
        } else {
          count += 8;
        }
        return true;
      }
      return;
    }).length;

    if (items[0] === "1") {
      // Subfield #1: Aircraft Operational Status age
      this.Aircraft_Operational_Status_age = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
      offset++;
    }
    if (items[1] === "1") {
      // Subfield #2: Target Report Descriptor age
      this.Target_Report_Descriptor_age = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
      offset++;
    }
    if (items[2] === "1") {
      // Subfield #3: Mode 3/A Code age
      this.Mode_3A_Code_age = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
      offset++;
    }
    if (items[3] === "1") {
      // Subfield #4: Quality Indicators age
      this.Quality_Indicators_age = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
      offset++;
    }
    if (items[4] === "1") {
      // Subfield #5: Trajectory Intent age
      this.Trajectory_Intent_age = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
      offset++;
    }
    if (items[5] === "1") {
      // Subfield #6: Message Amplitude age
      this.Message_Amplitude_age = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
      offset++;
    }
    if (items[6] === "1") {
      // Subfield #7: Geometric Height age
      this.Geometric_Height_age = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
      offset++;
    }
    if (items[7] === "1") {
      // More subfields
      if (items[8] === "1") {
        // Subfield #8: Flight Level age
        this.Flight_Level_age = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
        offset++;
      }
      if (items[9] === "1") {
        // Subfield #9: Intermediate State Selected Altitude age
        this.Intermediate_State_Selected_Altitude_age =
          parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
        offset++;
      }
      if (items[10] === "1") {
        // Subfield #10: Final State Selected Altitude age
        this.Final_State_Selected_Altitude_age =
          parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
        offset++;
      }
      if (items[11] === "1") {
        // Subfield #11: Air Speed age
        this.Air_Speed_age = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
        offset++;
      }
      if (items[12] === "1") {
        // Subfield #12: True Air Speed age
        this.True_Air_Speed_age = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
        offset++;
      }
      if (items[13] === "1") {
        // Subfield #13: Magnetic Heading age
        this.Magnetic_Heading_age = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
        offset++;
      }
      if (items[14] === "1") {
        // Subfield #14: Barometric Vertical Rate age
        this.Barometric_Vertical_Rate_age = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
        offset++;
      }
      if (items[15] === "1") {
        // More subfields
        if (items[16] === "1") {
          // Subfield #15: Geometric Vertical Rate age
          this.Geometric_Vertical_Rate_age = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
          offset++;
        }
        if (items[17] === "1") {
          // Subfield #16: Ground Vector age
          this.Ground_Vector_age = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
          offset++;
        }
        if (items[18] === "1") {
          // Subfield #17: Track Angle Rate age
          this.Track_Angle_Rate_age = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
          offset++;
        }
        if (items[19] === "1") {
          // Subfield #18: Target Identification age
          this.Target_Identification_age = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
          offset++;
        }
        if (items[20] === "1") {
          // Subfield #19: Target Status age
          this.Target_Status_age = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
          offset++;
        }
        if (items[21] === "1") {
          // Subfield #20: Met Information age
          this.Met_Information_age = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
          offset++;
        }
        if (items[22] === "1") {
          // Subfield #21: Roll Angle age
          this.Roll_Angle_age = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
          offset++;
        }
        if (items[23] === "1") {
          // More subfields
          if (items[24] === "1") {
            // Subfield #22: ACAS Resolution Advisory age
            this.ACAS_Resolution_Advisory_age = parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
            offset++;
          }
          if (items[25] === "1") {
            // Subfield #23: Surface Capabilities and Characteristics age
            this.Surface_Capabilities_and_Characteristics_age =
              parseInt("0x" + buffer.slice(offset, offset + 1).toString("hex")) * 0.1;
            offset++;
          }
        }
      }
    }
  }

  async set_receiver_ID(buffer: Buffer) {
    this.receiver_ID = "0x" + buffer.toString("hex").padStart(2, "0");
    this.csv[59] = this.receiver_ID;
  }
}

interface AircraftOperationalStatus {
  RA: string;
  TC: string;
  TS: string;
  ARV: string;
  CDTI: string;
  TCAS: string;
  SA: string;
}

interface DataSourceIdentifier {
  SAC: string;
  SIC: string;
}

interface TargetReportDescriptor {
  ATP: string;
  ARC: string;
  RC: string;
  RAB: string;
  DCR?: string;
  GBS?: string;
  SIM?: string;
  TST?: string;
  SAA?: string;
  CL?: string;
  IPC?: string;
  NOGO?: string;
  CPR?: string;
  LDPJ?: string;
  RCF?: string;
}

interface QualityIndicator {
  NUCr_or_NACv?: string;
  NUCp_or_NIC?: string;
  NICBARO?: string;
  SIL?: string;
  NACp?: string;
  SILsupplement?: string;
  SDA?: string;
  GVA?: string;
  PIC?: string;
}

interface TrajectoryIntent {
  TIS: boolean;
  NAV?: string;
  NVB?: string;
  TID: boolean;
  TIDvec?: TIData[];
}

interface TIData {
  TCA: string;
  NC: string;
  TCPnumber: string;
  Altitude: string;
  Latitude: string;
  Longitud: string;
  PointType: string;
  TD: string;
  TRA: string;
  TOA: string;
  TOV: string;
  TTR: string;
}

interface SelectedAltitude {
  SAS: string;
  Source: string;
  Altitude: string;
}

interface FinalStateSelectedAltitude {
  MV: string;
  AH: string;
  AM: string;
  Altitude: string;
}

interface AirborneGroundVector {
  GroundSpeed: string;
  TrackAngle: string;
}

interface TargetStatus {
  ICF: string;
  LNAV: string;
  PS: string;
  SS: string;
}

interface MOPSv {
  VNS: string;
  VN: string;
  LTT: string;
}

interface MetInformation {
  WS?: string;
  WD?: string;
  TMP?: string;
  TRB?: string;
}

interface ACAS_ResolutioinAdvisorReport {
  TYP: string;
  STYP: string;
  ARA: string;
  RAC: string;
  RAT: string;
  MTE: string;
  TTI: string;
  TID: string;
}

interface SurfaceCapabilitiesAndCharacteristics {
  POA: string;
  CDTI: string;
  B2low: string;
  RAS: string;
  IDENT: string;
  LW?: string;
}

interface WGS_84_coordinates {
  latitude: number;
  longitude: number;
}

export function fromTwosComplement(s: string) {
  //@ts-ignore
  return "0b" + s - s[0] * 2 ** s.length;
}
