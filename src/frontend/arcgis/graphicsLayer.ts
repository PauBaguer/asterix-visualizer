import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";

import type ArcGISMap from "@arcgis/core/Map";
import WebStyleSymbol from "@arcgis/core/symbols/WebStyleSymbol";
import type { Plane } from "../custom-types/ploted-objects";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import ObjectSymbol3DLayer from "@arcgis/core/symbols/ObjectSymbol3DLayer";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";

import PointSymbol3D from "@arcgis/core/symbols/PointSymbol3D";
import type { Cat10 } from "../custom-types/asterix/cat10";
import type { Cat21 } from "../custom-types/asterix/cat21";
import { getRhumbLineBearing } from "geolib";
import Polyline from "@arcgis/core/geometry/Polyline";

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
  graphicsLayer = new GraphicsLayer({ elevationInfo: { mode: "relative-to-ground" } });
  map.add(graphicsLayer);
}

export function parseMLATmessage(msg: Cat10) {
  if (planeMap.has(msg.target_address)) {
    planeMap.get(msg.target_address)?.mlat_msgs.push(msg);
  }
}

export function parseADSBmessage(msg: Cat21) {
  if (planeMap.has(msg.target_address)) {
    updatePlane(msg);
  } else {
    if (!msg.wgs_84_coordinates) return;
    let geometric_height = 0;
    let level = 0;
    let heading = 0;
    if (msg.geometric_height) {
      geometric_height = parseFloat(msg.geometric_height.substring(0, msg.geometric_height.length - 3));
    }
    if (msg.flight_level) {
      level = parseFloat(msg.flight_level.substring(2));
    }
    if (msg.airborne_ground_vector) {
      heading = parseFloat(
        msg.airborne_ground_vector.TrackAngle.substring(0, msg.airborne_ground_vector.TrackAngle.length - 4)
      );
    }

    const newPlane: Plane = {
      longitude: msg.wgs_84_coordinates.longitude,
      latitude: msg.wgs_84_coordinates.latitude,
      level,
      geometric_height,
      mlat_msgs: [],
      adsb_msgs: [msg],
      target_identification: msg.target_identification,
      target_address: msg.target_address,
      heading,
      graphic: undefined,
      pathGraphic: undefined,
    };

    planeMap.set(newPlane.target_address, newPlane);

    createPlane(newPlane.target_address);
  }
}

function createPlane(target_address: string) {
  const plane = planeMap.get(target_address)!;
  const newPoint = new Point({
    spatialReference: SpatialReference.WGS84,
    latitude: plane.latitude,
    longitude: plane.longitude,
    hasZ: true,
    z: plane.geometric_height * 0.3048,
  });

  const newGraphic = new Graphic({
    geometry: newPoint,
    symbol: new PointSymbol3D({
      symbolLayers: [
        new ObjectSymbol3DLayer({
          resource: {
            // the dependencies referenced in the gltf file will be requested as well
            href: "https://static.arcgis.com/arcgis/styleItems/RealisticTransportation/web/resource/Airplane_Large_Passenger.json",
          },
          heading: plane.heading,
          height: 12,
          anchor: "bottom",
        }),
      ],
    }),
    attributes: {
      target_identification: plane.target_identification,
      target_address: plane.target_identification,
    },
  });

  const newPath = new Polyline({ paths: [[[newPoint.x, newPoint.y, newPoint.z]]], hasZ: true });

  const newPathGraphic = new Graphic({
    geometry: newPath,
    symbol: new SimpleLineSymbol({
      color: [0, 0, 0, 1],
      width: 4,
    }),
  });

  plane.graphic = newGraphic;
  plane.pathGraphic = newPathGraphic;
  graphicsLayer.add(plane.graphic);
  graphicsLayer.add(plane.pathGraphic);
}

function updatePlane(msg: Cat21) {
  const plane = planeMap.get(msg.target_address)!;
  plane.adsb_msgs.push(msg);

  if (!msg.wgs_84_coordinates) return;
  let geometric_height = 0;
  let level = 0;
  let heading = 0;
  if (msg.geometric_height) {
    geometric_height = parseFloat(msg.geometric_height.substring(0, msg.geometric_height.length - 3));
  }
  if (msg.flight_level) {
    level = parseFloat(msg.flight_level.substring(2));
  }
  if (msg.airborne_ground_vector) {
    heading = parseFloat(
      msg.airborne_ground_vector.TrackAngle.substring(0, msg.airborne_ground_vector.TrackAngle.length - 4)
    );
  } else {
    heading = calculateHeading(plane);
  }

  plane.latitude = msg.wgs_84_coordinates.latitude;
  plane.longitude = msg.wgs_84_coordinates.longitude;
  plane.geometric_height = geometric_height;
  plane.level = level;

  const graphic = plane.graphic!;

  const newPoint = new Point({
    spatialReference: SpatialReference.WGS84,
    latitude: plane.latitude,
    longitude: plane.longitude,
    hasZ: true,
    z: plane.geometric_height * 0.3048,
  });

  const newSymbol = new PointSymbol3D({
    symbolLayers: [
      new ObjectSymbol3DLayer({
        resource: {
          // the dependencies referenced in the gltf file will be requested as well
          href: "https://static.arcgis.com/arcgis/styleItems/RealisticTransportation/web/resource/Airplane_Large_Passenger.json",
        },
        heading: heading,
        height: 12,
        anchor: "bottom",
      }),
    ],
  });

  const poly = plane.pathGraphic?.geometry as Polyline;
  poly.paths[0].push([newPoint.x, newPoint.y, newPoint.z]);

  const newPath = new Polyline({ paths: poly.paths, hasZ: true });

  plane.pathGraphic!.geometry = newPath;
  graphic.geometry = newPoint;
  graphic.symbol = newSymbol;
}

export function deletePlane(plane: Plane) {
  removePlane(plane);
  planeMap.delete(plane.target_address);
}

//only call this from exterior
// export function addPlane(plane: Plane) {
//   if (planeMap.has(plane.id)) {
//     graphicsLayer.add(planeMap.get(plane.id)!.graphic!);
//   } else createPlane(plane);
// }

export function removePlane(plane: Plane) {
  if (planeMap.has(plane.target_address)) {
    graphicsLayer.remove(plane.graphic!);
  }
}

function calculateHeading(plane: Plane) {
  const origin = plane.adsb_msgs[plane.adsb_msgs.length - 2].wgs_84_coordinates_high;
  const destination = plane.adsb_msgs[plane.adsb_msgs.length - 1].wgs_84_coordinates_high;
  return getRhumbLineBearing(
    { latitude: origin.latitude, longitude: origin.longitude },
    { latitude: destination.latitude, longitude: destination.longitude }
  );
}

export function clearGraphicsLayer() {
  graphicsLayer.removeAll();
  planeMap.clear();
}
