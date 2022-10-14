export interface Cat21 {
  id: number;
  class: 21;
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
  //acas_resolution_advisory_report
  surface_capabilities_and_characteristics: SurfaceCapabilitiesAndCharacteristics;
  //data_ages
  receiver_ID: string;
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
