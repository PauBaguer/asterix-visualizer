import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";

import type ArcGISMap from "@arcgis/core/Map";
import type { Cat10 } from "../custom-types/asterix/cat10";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import { computeDestinationPoint } from "geolib";

export let groundLayer: GraphicsLayer;

const graphicMap: Map<number, Graphic> = new Map();

const symbol = new SimpleMarkerSymbol({
  style: "circle",
  color: "#009900",
});
export function loadGroundLayer(map: ArcGISMap) {
  const graphic = new Graphic({
    geometry: new Point({
      latitude: 41.295618,
      longitude: 2.095114,
    }),
    symbol: symbol,
  });

  const target = new Graphic({
    geometry: new Point({ latitude: 41.30478992335686, longitude: 2.0985281688751427 }),
    symbol: symbol,
  });

  groundLayer = new GraphicsLayer();
  groundLayer.elevationInfo = { mode: "on-the-ground" };

  groundLayer.addMany([graphic, target]);
  map.add(groundLayer);

  const point: Point = graphic.geometry as Point;
  console.log("POINT COORDS");
  console.log({
    latitude: point.latitude,
    longitude: point.longitude,
    x: point.x,
    y: point.y,
    z: point.z,
  });
}

export function createGraphic(msg: Cat10) {
  const target_pos = computeDestinationPoint(
    { latitude: 41.295618, longitude: 2.095114 },
    Math.sqrt(Math.pow(msg.cartesian_coordinates.x, 2) + Math.pow(msg.cartesian_coordinates.y, 2)),
    1 / Math.tan(msg.cartesian_coordinates.y / msg.cartesian_coordinates.x)
  );
  const newPoint = new Point({
    spatialReference: SpatialReference.WGS84,
    latitude: target_pos.latitude,
    longitude: target_pos.longitude,
  });

  const newGraphic = new Graphic({
    geometry: newPoint,
    symbol: symbol,
    attributes: {
      id: msg.id,
    },
  });

  graphicMap.set(msg.id, newGraphic);
  groundLayer.add(newGraphic);
  console.log("target_pos ADDED");
}

export function deleteGraphic(msg: Cat10) {
  if (graphicMap.has(msg.id)) {
    groundLayer.remove(graphicMap.get(msg.id)!);
  } else {
    throw `${msg.id} not in graphicsMap`;
  }

  graphicMap.delete(msg.id);
}
