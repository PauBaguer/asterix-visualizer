export interface Cat10 {
  id: number;
  class: 10;
  message_type: string;
  data_source_identifier: DataSourceIdentifier;
  target_report_description: TargetReportDescription;
  wgs_84_coordinates: WGS_84_coordinates;
  polar_coordinates: PolarCoordinates;
  cartesian_coordinates: CartesianCoordinates;
  calculated_track_velocity_polar_coordinates: PolarCoordinates;
  calculated_track_velocity_cartesian_coordinates: CartesianCoordinates;
  mod_3A_code: Mod3ACode;
  flight_level: FlightLevel;
  measured_height: string;
  altitude_of_primary_plot: number;
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

interface WGS_84_coordinates {
  latitude: number;
  longitude: number;
}

interface PolarCoordinates {
  r: number;
  theta: number;
}

interface CartesianCoordinates {
  x: number;
  y: number;
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
