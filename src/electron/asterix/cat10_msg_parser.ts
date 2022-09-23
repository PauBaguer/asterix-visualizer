//import TwosComplementBuffer from "twos-complement-buffer";

export function parseCartesianCoordinate(buffer: Buffer) {
  const x_buffer = buffer.slice(0, 2);
  const y_buffer = buffer.slice(2, 4);
  console.log(x_buffer.toString("hex"));
  console.log(y_buffer.toString("hex"));
  const x_coord = x_buffer.readInt16BE(); // converter.unpack(x_buffer);
  console.log("X-coordinate: " + x_coord);

  const y_coord = y_buffer.readInt16BE(); //converter.unpack(y_buffer);
  console.log("Y-coordinate: " + y_coord);
}
