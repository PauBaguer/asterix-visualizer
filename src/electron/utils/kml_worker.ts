import { workerData, parentPort } from "node:worker_threads";
import { writeFile, createWriteStream } from "node:fs";
import { Cat10 } from "../asterix/cat10_decoder";
import { Cat21 } from "../asterix/cat21_decoder";
import { computeDestinationPoint } from "geolib";
const tokml = require("@maphubs/tokml");
const GeoJSON = require("geojson");

let messages: (Cat10 | Cat21)[] = [];
let started = false;
parentPort?.on("message", (data) => {
  messages = messages.concat(data);

  if (!started && workerData.messagesLength === messages.length) {
    doStuff();
    parentPort?.close();
  }
});

interface myLine {
  line: number[][];
  name: string;
  stroke: string;
}

const planeMap: Map<string, myLine> = new Map();

async function doStuff() {
  messages.forEach((msg) => {
    if (msg.instrument === "SMR") {
      const m = msg as Cat10;
      if (m.message_type !== "Target Report") return;
      if (!m.polar_coordinates) return;
      const target_pos = computeDestinationPoint(
        { latitude: 41.29561833, longitude: 2.095114167 },
        msg.polar_coordinates.r,
        msg.polar_coordinates.theta
      );
      if (planeMap.has(`smr-${m.track_number}`)) {
        planeMap.get(`smr-${m.track_number}`)!.line.push([target_pos.longitude, target_pos.latitude]);
      } else {
        planeMap.set(`smr-${m.track_number}`, {
          line: [[target_pos.longitude, target_pos.latitude]],
          name: `smr-${m.track_number}`,
          stroke: "#fe0000",
        });
      }
    } else if (msg.instrument === "MLAT") {
      const m = msg as Cat10;
      if (m.message_type !== "Target Report") return;
      if (!m.cartesian_coordinates) return;

      const target_pos = computeDestinationPoint(
        { latitude: 41.29706278, longitude: 2.078447222 },
        Math.sqrt(Math.pow(msg.cartesian_coordinates.x, 2) + Math.pow(msg.cartesian_coordinates.y, 2)),
        (Math.atan2(msg.cartesian_coordinates.x, msg.cartesian_coordinates.y) * 180) / Math.PI
      );

      if (planeMap.has(`mlat-${m.track_number}`)) {
        planeMap.get(`mlat-${m.track_number}`)!.line.push([target_pos.longitude, target_pos.latitude]);
      } else {
        planeMap.set(`mlat-${m.track_number}`, {
          line: [[target_pos.longitude, target_pos.latitude]],
          name: `mlat-${m.track_number}`,
          stroke: "#ffeb16",
        });
      }
    } else {
      const m = msg as Cat21;

      if (!m.wgs_84_coordinates) return;
      if (planeMap.has(`adsb-${m.track_number}`)) {
        planeMap
          .get(`adsb-${m.track_number}`)!
          .line.push([m.wgs_84_coordinates.longitude, m.wgs_84_coordinates.latitude]);
      } else {
        planeMap.set(`adsb-${m.track_number}`, {
          line: [[m.wgs_84_coordinates.longitude, m.wgs_84_coordinates.latitude]],
          name: `adsb-${m.track_number}`,
          stroke: "#6733bb",
        });
      }
    }
  });

  let points: any[] = [
    { latitude: 41.29561833, longitude: 2.095114167, name: "SMR" },
    { latitude: 41.29706278, longitude: 2.078447222, name: "MLAT" },
  ];

  points = points.concat(Array.from(planeMap.values()));

  const geojsonObject = GeoJSON.parse(points, {
    Point: ["latitude", "longitude"],
    LineString: "line",
  });

  const response = tokml(geojsonObject, {
    name: "name",

    documentName: "List of plane paths by Positioning Instrument",
    documentDescription:
      "Naming scheme: Instrument-track_number, Color legend: SMR as red, MLAT as yellow, ADS-B as purple",
    simplestyle: true,
  });

  const fil = createWriteStream(workerData.filePath);
  fil.write(Buffer.from(response));

  fil.end();
  fil.close();
}
