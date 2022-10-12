import Map from "@arcgis/core/Map";
import type Graphic from "@arcgis/core/Graphic";
import SceneView from "@arcgis/core/views/SceneView";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import { loadGraphicsLayer, graphicsLayer } from "./graphicsLayer";
import { loadGroundLayer } from "./groundLayer";

export function initializeMap() {
  console.log("i say hi");

  setTimeout(initMap, 500);
}

function initMap() {
  const view = new SceneView({
    // An instance of Map or WebScene
    map: new Map({
      basemap: "satellite",
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

  // Get the screen point from the view's click event
  view.on("click", function (event) {
    var screenPoint = {
      x: event.x,
      y: event.y,
    };

    // Search for graphics at the clicked location
    view.hitTest(screenPoint).then(function (response) {
      if (response.results.length) {
        const graphic: Graphic = response.results.filter(function (result) {
          if (result.type === "graphic") {
            // check if the graphic belongs to the layer of interest
            return result.graphic.layer === graphicsLayer;
          }
          return false;
          // @ts-ignore
        })[0].graphic;
        // do something with the result graphic
        console.log(graphic.attributes);
      }
    });
  });
}
