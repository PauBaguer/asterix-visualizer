import Map from "@arcgis/core/Map";
import SceneView from "@arcgis/core/views/SceneView";
import { loadGraphicsLayer } from "./graphicsLayer";

export function initializeMap() {
  console.log("i say hi");

  setTimeout(function () {
    const view = new SceneView({
      // An instance of Map or WebScene
      map: new Map({
        basemap: "hybrid",
        ground: "world-elevation",
      }),

      // The id of a DOM element (may also be an actual DOM element)
      container: "viewDiv",
    });

    view.when(() => {
      console.log("Map is loaded");
      loadGraphicsLayer(view.map);
    });
  }, 500);
}
