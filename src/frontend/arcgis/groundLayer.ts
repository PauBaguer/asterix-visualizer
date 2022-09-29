import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";

import type ArcGISMap from "@arcgis/core/Map";

export let groundLayer: GraphicsLayer;

export function loadGroundLayer(map: ArcGISMap) {
  const symbol = new SimpleMarkerSymbol({
    style: "circle",
    color: "#009900",
  });

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
