import { workerData, parentPort } from "node:worker_threads";
import { writeFile, createWriteStream } from "node:fs";
import { Cat10 } from "../asterix/cat10_decoder";
import { Cat21 } from "../asterix/cat21_decoder";

let messages: (Cat10 | Cat21)[] = [];
let started = false;
parentPort?.on("message", (data) => {
  messages = messages.concat(data);

  if (!started && workerData.messagesLength === messages.length) {
    doStuff();
    parentPort?.close();
  }
});

async function doStuff() {
  const mgs: (Cat10 | Cat21)[] = messages as (Cat10 | Cat21)[];

  const fil = createWriteStream(workerData.filePath);

  fil.write(
    "Id,Class,Message type,Data source identifier,Target report description,WGS84 coordinates,Polar coordinates,Cartesian coordinates,Calculated track velocity polar coordinates,Calculated track velocity cartesian coordinates,Mod 3A code,Flight level,Measured height,Altitude of primary plot,Time of day,Track number,Track status,Calculated acceleration,Target address,Target identification,Mode S MB data,Target size and orientation,Presence,Vehicle fleet identification,Preprogrammed message,Standard deviation of position,System status,Aircraft operational status,Service identification,Service management,Emitter category,Target report descriptor,Time applicability position,Time applicability velocity,Time message reception position,Time message reception position high,Time message reception velocity,Time message reception velocity high,TimeASTERIX report transmission,Quality indicator,Tarjectory intent,WGS84 coordinates high,Message amplitude,Geometric height,Selected altitude,Final state selected altitude,Air speed,True airspeed,Magnetic heading,Barometric vertical rate,Geometric vertical rate,Airborne ground vector,Track angle rate,Target status,MOPS version,Met information,Roll angle,ACAS resolution advisory report,Surface capabilities and characteristics,Receiver ID \n"
  );

  await mgs.forEach((value) => {
    if (value.class === "Cat10") {
      value = value as Cat10;
      fil.write('"' + tocsvCat10(value).join('","') + '" \n');
    } else {
      value = value as Cat21;
      fil.write('"' + tocsvCat21(value).join('","') + '" \n');
    }
  });

  fil.end();
  fil.close();

  //   writeFile(workerData.filePath, csvContent, (err) => {
  //     if (err) console.error(err);
  //   });
}

function tocsvCat10(msg: Cat10) {
  let csv: string[];
  csv = Array(60).fill(" ");
  csv[0] = msg.id.toString();
  csv[1] = "Cat10";

  csv[2] = msg.message_type;
  csv[3] = "SAC: " + msg.data_source_identifier.SAC + " SIC: " + msg.data_source_identifier.SIC;

  if (msg.target_report_description) {
    if (msg.target_report_description.TOT) {
      csv[4] =
        "TYP: " +
        msg.target_report_description.TYP +
        " DCR: " +
        msg.target_report_description.DCR +
        " CHN: " +
        msg.target_report_description.CHN +
        " GBS: " +
        msg.target_report_description.GBS +
        " CRT:" +
        msg.target_report_description.CRT +
        " SIM: " +
        msg.target_report_description.SIM +
        " TST: " +
        msg.target_report_description.TST +
        " RAB: " +
        msg.target_report_description.RAB +
        " LOP: " +
        msg.target_report_description.LOP +
        " TOT: " +
        msg.target_report_description.TOT;
    } else {
      csv[4] =
        "TYP: " +
        msg.target_report_description.TYP +
        " DCR: " +
        msg.target_report_description.DCR +
        " CHN: " +
        msg.target_report_description.CHN +
        " GBS: " +
        msg.target_report_description.GBS +
        " CRT:" +
        msg.target_report_description.CRT;
    }
  }
  if (msg.wgs_84_coordinates)
    csv[5] = "Latitude: " + msg.wgs_84_coordinates.latitude + " Longitude: " + msg.wgs_84_coordinates.longitude;

  if (msg.polar_coordinates) csv[6] = "r: " + msg.polar_coordinates.r + " theta: " + msg.polar_coordinates.theta;

  if (msg.cartesian_coordinates) csv[7] = "x: " + msg.cartesian_coordinates.x + " y: " + msg.cartesian_coordinates.y;

  if (msg.calculated_track_velocity_polar_coordinates)
    csv[8] =
      "r: " +
      msg.calculated_track_velocity_polar_coordinates.r +
      " theta: " +
      msg.calculated_track_velocity_polar_coordinates.theta;

  if (msg.calculated_track_velocity_cartesian_coordinates)
    csv[9] =
      "x: " +
      msg.calculated_track_velocity_cartesian_coordinates.x +
      " y: " +
      msg.calculated_track_velocity_cartesian_coordinates.y;

  if (msg.mod_3A_code)
    csv[10] =
      "V: " +
      msg.mod_3A_code.V +
      " G: " +
      msg.mod_3A_code.G +
      " L: " +
      msg.mod_3A_code.L +
      " Mode: " +
      msg.mod_3A_code.Mode;

  if (msg.flight_level)
    csv[11] =
      "V: " + msg.flight_level.V + " G: " + msg.flight_level.G + " FlightLevel: " + msg.flight_level.FlightLevel;

  if (msg.measured_height) csv[12] = msg.measured_height;

  if (msg.amplitude_of_primary_plot) csv[13] = msg.amplitude_of_primary_plot.toString();

  if (msg.time_of_day) csv[14] = msg.time_of_day.toString();

  if (msg.track_number) csv[15] = msg.track_number.toString();

  if (msg.track_status) {
    if (msg.track_status.GHO) {
      csv[16] =
        "CNF: " +
        msg.track_status.CNF +
        " TRE: " +
        msg.track_status.TRE +
        " CST: " +
        msg.track_status.CST +
        " MAH: " +
        msg.track_status.MAH +
        " TCC: " +
        msg.track_status.TCC +
        " STH: " +
        msg.track_status.STH +
        " TOM: " +
        msg.track_status.TOM +
        " DOU: " +
        msg.track_status.DOU +
        " MRS: " +
        msg.track_status.MRS +
        " GHO: " +
        msg.track_status.GHO;
    } else if (msg.track_status.DOU) {
      csv[16] =
        "CNF: " +
        msg.track_status.CNF +
        " TRE: " +
        msg.track_status.TRE +
        " CST: " +
        msg.track_status.CST +
        " MAH: " +
        msg.track_status.MAH +
        " TCC: " +
        msg.track_status.TCC +
        " STH: " +
        msg.track_status.STH +
        " TOM: " +
        msg.track_status.TOM +
        " DOU: " +
        msg.track_status.DOU +
        " MRS: " +
        msg.track_status.MRS;
    } else {
      csv[16] =
        "CNF: " +
        msg.track_status.CNF +
        " TRE: " +
        msg.track_status.TRE +
        " CST: " +
        msg.track_status.CST +
        " MAH: " +
        msg.track_status.MAH +
        " TCC: " +
        msg.track_status.TCC +
        " STH: " +
        msg.track_status.STH;
    }
  }

  if (msg.calculated_acceleration)
    csv[17] = "Ax: " + msg.calculated_acceleration.Ax + " Ay: " + msg.calculated_acceleration.Ay;

  if (msg.target_identification) csv[19] = msg.target_identification.target_identification;

  if (msg.mode_s_mb_data) csv[20] = msg.mode_s_mb_data.join(" / ");

  if (msg.target_size_and_orientation) {
    if (msg.target_size_and_orientation.Width) {
      csv[21] =
        "Length: " +
        msg.target_size_and_orientation.Lenght +
        " Orientation: " +
        msg.target_size_and_orientation.Orinetation +
        " Width: " +
        msg.target_size_and_orientation.Width;
    } else if (msg.target_size_and_orientation.Orinetation) {
      csv[21] =
        "Length: " +
        msg.target_size_and_orientation.Lenght +
        "Orientation: " +
        msg.target_size_and_orientation.Orinetation;
    } else {
      csv[21] = "Lenght: " + msg.target_size_and_orientation.Lenght;
    }
  }

  if (msg.presence) {
    msg.presence.forEach((v) => {
      csv[22] = csv[22] + "/ " + "DRHO: " + v.DRHO + " DTHETA: " + v.DTHETA;
    });
  }

  if (msg.vehicle_fleet_identification) csv[23] = msg.vehicle_fleet_identification;

  if (msg.preprogrammed_message)
    csv[24] = "TRB: " + msg.preprogrammed_message.TRB + " MSG: " + msg.preprogrammed_message.MSG;

  if (msg.standard_deviation_of_position)
    csv[25] =
      "X_component: " +
      msg.standard_deviation_of_position.X_component +
      " Y_component: " +
      msg.standard_deviation_of_position.Y_component +
      " Covariance: " +
      msg.standard_deviation_of_position.Covariance;

  if (msg.system_status)
    csv[26] =
      "NOGO: " +
      msg.system_status.NOGO +
      " OVL: " +
      msg.system_status.OVL +
      " TSV: " +
      msg.system_status.TSV +
      " DIV: " +
      msg.system_status.DIV +
      " TTF: " +
      msg.system_status.TTF;

  return csv;
}

function tocsvCat21(msg: Cat21) {
  let csv: string[];
  csv = Array(60).fill(" ");
  csv[0] = msg.id.toString();
  csv[1] = "Cat21";

  if (msg.aircraft_operational_status)
    csv[27] =
      "RA: " +
      msg.aircraft_operational_status.RA +
      " TC: " +
      msg.aircraft_operational_status.TC +
      " TS: " +
      msg.aircraft_operational_status.TS +
      " ARV: " +
      msg.aircraft_operational_status.ARV +
      " CDTI:" +
      msg.aircraft_operational_status.CDTI +
      " TCAS: " +
      msg.aircraft_operational_status.TCAS +
      " SA: " +
      msg.aircraft_operational_status.SA;

  if (msg.service_identification) csv[28] = msg.service_identification;

  if (msg.service_management) csv[29] = msg.service_management;

  if (msg.emitter_category) csv[30] = msg.emitter_category;

  if (msg.target_report_descriptor) {
    if (msg.target_report_descriptor.RCF) {
      csv[31] =
        "ATP: " +
        msg.target_report_descriptor.ATP +
        " ARC: " +
        msg.target_report_descriptor.ARC +
        " RC: " +
        msg.target_report_descriptor.RC +
        " RAB: " +
        msg.target_report_descriptor.RAB +
        " DCR: " +
        msg.target_report_descriptor.DCR +
        " GBS: " +
        msg.target_report_descriptor.GBS +
        " SIM: " +
        msg.target_report_descriptor.SIM +
        " TST: " +
        msg.target_report_descriptor.TST +
        " SAA: " +
        msg.target_report_descriptor.SAA +
        " CL: " +
        msg.target_report_descriptor.CL +
        " IPC: " +
        msg.target_report_descriptor.IPC +
        " NOGO: " +
        msg.target_report_descriptor.NOGO +
        " CPR: " +
        msg.target_report_descriptor.CPR +
        " LDPJ: " +
        msg.target_report_descriptor.LDPJ +
        " RCF: " +
        msg.target_report_descriptor.RCF;
    } else if (msg.target_report_descriptor.SAA) {
      csv[31] =
        "ATP: " +
        msg.target_report_descriptor.ATP +
        " ARC: " +
        msg.target_report_descriptor.ARC +
        " RC: " +
        msg.target_report_descriptor.RC +
        " RAB: " +
        msg.target_report_descriptor.RAB +
        " DCR: " +
        msg.target_report_descriptor.DCR +
        " GBS: " +
        msg.target_report_descriptor.GBS +
        " SIM: " +
        msg.target_report_descriptor.SIM +
        " TST: " +
        msg.target_report_descriptor.TST +
        " SAA: " +
        msg.target_report_descriptor.SAA +
        " CL: " +
        msg.target_report_descriptor.CL;
    } else {
      csv[31] =
        "ATP: " +
        msg.target_report_descriptor.ATP +
        " ARC: " +
        msg.target_report_descriptor.ARC +
        " RC: " +
        msg.target_report_descriptor.RC +
        " RAB: " +
        msg.target_report_descriptor.RAB;
    }
  }

  if (msg.mod_3A_code) csv[10] = msg.mod_3A_code;

  if (msg.time_applicability_position) csv[32] = msg.time_applicability_position.toString();

  if (msg.time_applicability_velocity) csv[33] = msg.time_applicability_velocity.toString();

  if (msg.time_message_reception_position) csv[34] = msg.time_message_reception_position.toString();

  if (msg.time_message_reception_position_high) csv[35] = msg.time_message_reception_position_high.toString();

  if (msg.time_message_reception_velocity) csv[36] = msg.time_message_reception_velocity.toString();

  if (msg.time_message_reception_velocity_high) csv[37] = msg.time_message_reception_velocity_high.toString();

  if (msg.time_ASTERIX_report_transmission) csv[38] = msg.time_ASTERIX_report_transmission.toString();

  if (msg.target_address) csv[18] = msg.target_address;

  if (msg.quality_indicator) {
    if (msg.quality_indicator.PIC) {
      csv[39] =
        "NUCr_or_NACv: " +
        msg.quality_indicator.NUCr_or_NACv +
        " NUCp_or_NIC: " +
        msg.quality_indicator.NUCp_or_NIC +
        " NICBARO: " +
        msg.quality_indicator.NICBARO +
        " SIL: " +
        msg.quality_indicator.SIL +
        " NACP: " +
        msg.quality_indicator.NACp +
        " SILsupplement: " +
        msg.quality_indicator.SILsupplement +
        " GVA: " +
        msg.quality_indicator.GVA +
        " PIC: " +
        msg.quality_indicator.PIC;
    } else if (msg.quality_indicator.GVA) {
      csv[39] =
        "NUCr_or_NACv: " +
        msg.quality_indicator.NUCr_or_NACv +
        " NUCp_or_NIC: " +
        msg.quality_indicator.NUCp_or_NIC +
        " NICBARO: " +
        msg.quality_indicator.NICBARO +
        " SIL: " +
        msg.quality_indicator.SIL +
        " NACP: " +
        msg.quality_indicator.NACp +
        " SILsupplement: " +
        msg.quality_indicator.SILsupplement +
        " GVA: " +
        msg.quality_indicator.GVA;
    } else if (msg.quality_indicator.SIL) {
      csv[39] =
        "NUCr_or_NACv: " +
        msg.quality_indicator.NUCr_or_NACv +
        " NUCp_or_NIC: " +
        msg.quality_indicator.NUCp_or_NIC +
        " NICBARO: " +
        msg.quality_indicator.NICBARO +
        " SIL: " +
        msg.quality_indicator.SIL +
        " NACP: " +
        msg.quality_indicator.NACp;
    } else {
      csv[39] =
        "NUCr_or_NACv: " + msg.quality_indicator.NUCr_or_NACv + " NUCp_or_NIC: " + msg.quality_indicator.NUCp_or_NIC;
    }
  }

  if (msg.tarjectory_intent) {
    csv[40] =
      "TIS: " +
      msg.tarjectory_intent.TIS +
      " NAV: " +
      msg.tarjectory_intent.NAV +
      " NVB: " +
      msg.tarjectory_intent.NVB +
      " TID: " +
      msg.tarjectory_intent.TID;
  }

  if (msg.wgs_84_coordinates)
    csv[5] = "Latitude: " + msg.wgs_84_coordinates.latitude + " Longitude: " + msg.wgs_84_coordinates.longitude;

  if (msg.wgs_84_coordinates_high)
    csv[41] =
      "Latitude: " + msg.wgs_84_coordinates_high.latitude + " Longitude: " + msg.wgs_84_coordinates_high.longitude;

  if (msg.message_amplitude) csv[42] = msg.message_amplitude;

  if (msg.geometric_height) csv[43] = msg.geometric_height;

  if (msg.flight_level) csv[11] = msg.flight_level;

  if (msg.selected_altitude)
    csv[44] =
      "SAS: " +
      msg.selected_altitude.SAS +
      " Source: " +
      msg.selected_altitude.Source +
      " Altitude: " +
      msg.selected_altitude.Altitude;

  if (msg.final_state_selected_altitude)
    csv[45] =
      "MV: " +
      msg.final_state_selected_altitude.MV +
      " AH: " +
      msg.final_state_selected_altitude.AH +
      " AM: " +
      msg.final_state_selected_altitude.AM +
      " Altitude: " +
      msg.final_state_selected_altitude.Altitude;

  if (msg.air_speed) csv[46] = msg.air_speed;

  if (msg.true_airspeed) csv[47] = msg.true_airspeed;

  if (msg.magnetic_heading) csv[48] = msg.magnetic_heading;

  if (msg.barometric_vertical_rate) csv[49] = msg.barometric_vertical_rate;

  if (msg.geometric_vertical_rate) csv[50] = msg.geometric_vertical_rate;

  if (msg.airborne_ground_vector)
    csv[51] =
      "GroundSpeed: " +
      msg.airborne_ground_vector.GroundSpeed +
      " TrackAngle: " +
      msg.airborne_ground_vector.TrackAngle;

  if (msg.track_number) csv[15] = msg.track_number.toString();

  if (msg.track_angle_rate) csv[52] = msg.track_angle_rate.toString();

  if (msg.target_identification) csv[19] = msg.target_identification;

  if (msg.target_status)
    csv[53] =
      "ICF: " +
      msg.target_status.ICF +
      " LNAV: " +
      msg.target_status.LNAV +
      " PS: " +
      msg.target_status.PS +
      " SS: " +
      msg.target_status.SS;

  if (msg.mops_version)
    csv[54] = "VNS: " + msg.mops_version.VNS + " VN: " + msg.mops_version.VN + " LTT: " + msg.mops_version.LTT;

  if (msg.met_information)
    csv[55] =
      "WS: " +
      msg.met_information.WS +
      " WD: " +
      msg.met_information.WD +
      " TMP: " +
      msg.met_information.TMP +
      " TRB: " +
      msg.met_information.TRB;

  if (msg.roll_angle) csv[56] = msg.roll_angle;

  if (msg.mode_s_mb_data) csv[20] = msg.mode_s_mb_data.join(" / ");

  if (msg.acas_resolution_advisory_report) {
    csv[57] =
      "TYP: " +
      msg.acas_resolution_advisory_report.TYP +
      " STYP: " +
      msg.acas_resolution_advisory_report.STYP +
      " ARA: " +
      msg.acas_resolution_advisory_report.ARA +
      " RAC: " +
      msg.acas_resolution_advisory_report.RAC +
      " RAT: " +
      msg.acas_resolution_advisory_report.RAT +
      " MTE: " +
      msg.acas_resolution_advisory_report.MTE +
      " TTI: " +
      msg.acas_resolution_advisory_report.TTI +
      " TID: " +
      msg.acas_resolution_advisory_report.TID;
  }

  if (msg.surface_capabilities_and_characteristics) {
    if (msg.surface_capabilities_and_characteristics.LW) {
      csv[58] =
        "POA: " +
        msg.surface_capabilities_and_characteristics.POA +
        " CDTI: " +
        msg.surface_capabilities_and_characteristics.CDTI +
        " B2low: " +
        msg.surface_capabilities_and_characteristics.B2low +
        " RAS: " +
        msg.surface_capabilities_and_characteristics.RAS +
        " IDENT: " +
        msg.surface_capabilities_and_characteristics.IDENT +
        " LW: " +
        msg.surface_capabilities_and_characteristics.LW;
    } else {
      csv[58] =
        "POA: " +
        msg.surface_capabilities_and_characteristics.POA +
        " CDTI: " +
        msg.surface_capabilities_and_characteristics.CDTI +
        " B2low: " +
        msg.surface_capabilities_and_characteristics.B2low +
        " RAS: " +
        msg.surface_capabilities_and_characteristics.RAS +
        " IDENT: " +
        msg.surface_capabilities_and_characteristics.IDENT;
    }
  }

  if (msg.receiver_ID) csv[59] = msg.receiver_ID;

  return csv;
}
