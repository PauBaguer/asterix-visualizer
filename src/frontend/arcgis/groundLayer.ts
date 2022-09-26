import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";

import type Map from "@arcgis/core/Map";

export let groundLayer: GraphicsLayer;

export function loadGroundLayer(map: Map) {
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
  groundLayer = new GraphicsLayer();
  groundLayer.elevationInfo = { mode: "on-the-ground" };

  groundLayer.add(graphic);
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
