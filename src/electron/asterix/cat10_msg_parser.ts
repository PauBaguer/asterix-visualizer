import { computeDestinationPoint } from "geolib";
// export function parseDataSourceIdentifier(buffer: Buffer) {
//   const sac_buffer = buffer.slice(0, 2);
//   const sic_buffer = buffer.slice(2, 4);

//   const sac = sac_buffer.readInt16BE();

//   console.log("SAC: ", sac);
//   if (sac === 0) {
//     console.log("SAC = 0, Local airport Identifier");
//   }

//   const sic = sic_buffer.readInt16BE();
//   console.log("SIC: ", sic);
// }

export function parseCartesianCoordinate(buffer: Buffer) {
  const x_buffer = buffer.slice(0, 2);
  const y_buffer = buffer.slice(2, 4);
  const x_coord = x_buffer.readInt16BE();
  console.log("X-coordinate: " + x_coord);

  const y_coord = y_buffer.readInt16BE();
  console.log("Y-coordinate: " + y_coord);
}

export function parsePolarCoordinate(buffer: Buffer) {
  const r_buffer = buffer.slice(0, 2);
  const theta_buffer = buffer.slice(2, 4);
  const r_coord = r_buffer.readInt16BE();
  console.log("r-coordinate: " + r_coord);

  const theta_coord = (theta_buffer.readInt16BE() * 360) / Math.pow(2, 16);
  console.log("Theta-coordinate: " + theta_coord + "º");

  const target_pos = computeDestinationPoint({ latitude: 41.295618, longitude: 2.095114 }, r_coord, theta_coord);
  console.log({ TARGET_POS: target_pos });
}
