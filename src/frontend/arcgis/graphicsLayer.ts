import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";

import type Map from "@arcgis/core/Map";

export let graphicsLayer: GraphicsLayer;

export function loadGraphicsLayer(map: Map) {
  const symbol = new SimpleMarkerSymbol({
    style: "circle",
    color: "#ff9900",
  });

  const graphic = new Graphic({
    geometry: new Point({
      latitude: 41.302189,
      longitude: 2.082842,
      z: 150,
    }),
    symbol: symbol,
  });
  graphicsLayer = new GraphicsLayer();

  graphicsLayer.add(graphic);
  map.add(graphicsLayer);
}
