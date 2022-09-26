import Map from "@arcgis/core/Map";
import SceneView from "@arcgis/core/views/SceneView";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import { loadGraphicsLayer } from "./graphicsLayer";
import { loadGroundLayer } from "./groundLayer";

export function initializeMap() {
  console.log("i say hi");

  setTimeout(function () {
    const view = new SceneView({
      // An instance of Map or WebScene
      map: new Map({
        basemap: "hybrid",
        ground: "world-elevation",
      }),
      camera: {
        heading: 0,
        position: {
          // observation point
          latitude: 41.25,
          longitude: 2.08,
          z: 3750, // zoom level
        },
        tilt: 50, // perspective in degrees
      },
      spatialReference: SpatialReference.WGS84,

      // The id of a DOM element (may also be an actual DOM element)
      container: "viewDiv",
    });

    view.when(() => {
      console.log("Map is loaded");

      loadGraphicsLayer(view.map);
      loadGroundLayer(view.map);
    });
  }, 500);
}
