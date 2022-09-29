import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";

import type ArcGISMap from "@arcgis/core/Map";
import WebStyleSymbol from "@arcgis/core/symbols/WebStyleSymbol";
import type { Plane } from "../custom-types/ploted-objects";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";

export let graphicsLayer: GraphicsLayer;

const planeMap: Map<string, Plane> = new Map();

// const symbol = new SimpleMarkerSymbol({
//   style: "circle",
//   color: "#009900",
// });
const planeSymbol = new WebStyleSymbol({
  name: "Airplane_Private",
  styleName: "EsriRealisticTransportationStyle",
});

export function loadGraphicsLayer(map: ArcGISMap) {
  graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

  addPlane({
    id: "test-plane",
    latitude: 41.295618,
    longitude: 2.095114,
    level: 150,
    graphic: undefined,
  });
}

function createPlane(plane: Plane) {
  if (planeMap.has(plane.id)) return;

  const newPoint = new Point({
    spatialReference: SpatialReference.WGS84,
    latitude: plane.latitude,
    longitude: plane.longitude,
    hasZ: true,
    z: plane.level,
  });

  const newGraphic = new Graphic({
    geometry: newPoint,
    symbol: planeSymbol,
    attributes: {
      id: plane.id,
    },
  });

  plane.graphic = newGraphic;
  planeMap.set(plane.id, plane);
  graphicsLayer.add(plane.graphic);
  console.log("PLANE ADDED");
}

export function deletePlane(plane: Plane) {
  removePlane(plane);
  planeMap.delete(plane.id);
}

//only call this from exterior
export function addPlane(plane: Plane) {
  if (planeMap.has(plane.id)) {
    graphicsLayer.add(planeMap.get(plane.id)!.graphic!);
  } else createPlane(plane);
}

export function removePlane(plane: Plane) {
  if (planeMap.has(plane.id)) {
    graphicsLayer.remove(planeMap.get(plane.id)!.graphic!);
  } else {
    throw `${plane.id} not in planeMap`;
  }
}
