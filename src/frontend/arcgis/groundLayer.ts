import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";

import type ArcGISMap from "@arcgis/core/Map";
import type { Cat10 } from "../custom-types/asterix/cat10";
import type { Cat21 } from "../custom-types/asterix/cat21";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import { computeDestinationPoint } from "geolib";

export let groundLayer: GraphicsLayer;

const graphicMap: Map<number, Graphic> = new Map();

const symbol = new SimpleMarkerSymbol({
  style: "circle",
  color: "#009900",
});

const symbolSMR = new SimpleMarkerSymbol({
  style: "circle",
  color: "#fe0000",
  size: 4,
});

const symbolMLAT = new SimpleMarkerSymbol({
  style: "circle",
  color: "ffeb16",
  size: 4,
});

const symbolADSB = new SimpleMarkerSymbol({
  style: "circle",
  color: "#6733bb",
  size: 4,
});

export function loadGroundLayer(map: ArcGISMap) {
  const graphicsmr = new Graphic({
    geometry: new Point({
      latitude: 41.29561833,
      longitude: 2.095114167,
    }),
    symbol: symbol,
  });

  const graphicmlat = new Graphic({
    geometry: new Point({ latitude: 41.29706278, longitude: 2.078447222 }),
    symbol: symbol,
  });

  // const target = new Graphic({
  //   geometry: new Point({ latitude: 41.30478992335686, longitude: 2.0985281688751427 }),
  //   symbol: symbol,
  // });

  groundLayer = new GraphicsLayer();
  const constLayer = new GraphicsLayer();
  groundLayer.elevationInfo = { mode: "on-the-ground" };
  constLayer.elevationInfo = { mode: "on-the-ground" };

  constLayer.addMany([graphicsmr, graphicmlat]);
  map.add(groundLayer);
  map.add(constLayer);
}

export function createGraphicSMR(msg: Cat10) {
  if (!msg.cartesian_coordinates) return;

  // console.log("Adding smr");
  // console.log({ smr: msg });
  const target_pos = computeDestinationPoint(
    { latitude: 41.29561833, longitude: 2.095114167 },
    msg.polar_coordinates.r,
    msg.polar_coordinates.theta
  );
  const newPoint = new Point({
    spatialReference: SpatialReference.WGS84,
    latitude: target_pos.latitude,
    longitude: target_pos.longitude,
  });

  const newGraphic = new Graphic({
    geometry: newPoint,
    symbol: symbolSMR,
    attributes: {
      id: msg.id,
      type: "smr",
    },
  });

  graphicMap.set(msg.id, newGraphic);
  groundLayer.add(newGraphic);
  //console.log(`SMR added`);
}

export function createGraphicMLAT(msg: Cat10) {
  if (!msg.cartesian_coordinates) return;
  console.log("Adding mlat");
  console.log({ mlat: msg });

  const target_pos = computeDestinationPoint(
    { latitude: 41.29706278, longitude: 2.078447222 },
    Math.sqrt(Math.pow(msg.cartesian_coordinates.x, 2) + Math.pow(msg.cartesian_coordinates.y, 2)),
    (Math.atan2(msg.cartesian_coordinates.x, msg.cartesian_coordinates.y) * 180) / Math.PI
  );
  const newPoint = new Point({
    spatialReference: SpatialReference.WGS84,
    latitude: target_pos.latitude,
    longitude: target_pos.longitude,
  });

  const newGraphic = new Graphic({
    geometry: newPoint,
    symbol: symbolMLAT,
    attributes: {
      id: msg.id,
      type: "mlat",
    },
  });
  graphicMap.set(msg.id, newGraphic);
  groundLayer.add(newGraphic);
  console.log(`MLAT added`);
}

export function createGraphicADSB(msg: Cat21) {
  if (!msg.wgs_84_coordinates) return;
  console.log("Adding adsb");
  console.log({ adsb: msg });

  const newPoint = new Point({
    spatialReference: SpatialReference.WGS84,
    latitude: msg.wgs_84_coordinates.latitude,
    longitude: msg.wgs_84_coordinates.longitude,
  });

  const newGraphic = new Graphic({
    geometry: newPoint,
    symbol: symbolADSB,
    attributes: {
      id: msg.id,
      type: "adsb",
    },
  });
  graphicMap.set(msg.id, newGraphic);
  groundLayer.add(newGraphic);
  console.log(`adsb added`);
}

export function deleteGraphic(msg: Cat10 | Cat21) {
  if (graphicMap.has(msg.id)) {
    groundLayer.remove(graphicMap.get(msg.id)!);
    graphicMap.delete(msg.id);
  }
}

export function clearMap() {
  groundLayer.removeAll();
  graphicMap.clear();
}
