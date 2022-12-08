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
import { flyTo } from "./map";

let planesLayer: GraphicsLayer;
let pathsLayer: GraphicsLayer;
let selectedPlane: string | null = null;

const pathsymbol = new SimpleLineSymbol({
  color: [0, 0, 0, 1],
  width: 4,
});

const elem = document.querySelector("body")!;

const popupTemplate = {
  title: "{target_identification}",
  content: [
    {
      type: "fields",
      fieldInfos: [
        {
          fieldName: "target_identification",
          label: "Call sign",
        },
        {
          fieldName: "target_address",
          label: "Target Address",
        },
        {
          fieldName: "latitude",
          label: "Latitude",
        },
        {
          fieldName: "longitude",
          label: "Longitude",
        },
        {
          fieldName: "data_source_identifier",
          label: "Data Source Identifier",
        },
        {
          fieldName: "FL",
          label: "Flight Level",
        },
        {
          fieldName: "height",
          label: "Height MSL",
        },
        {
          fieldName: "heading",
          label: "Heading",
        },
      ],
    },
  ],
};

export const planeMap: Map<string, Plane> = new Map();

// const symbol = new SimpleMarkerSymbol({
//   style: "circle",
//   color: "#009900",
// });

export function loadGraphicsLayer(map: ArcGISMap) {
  planesLayer = new GraphicsLayer({ elevationInfo: { mode: "relative-to-ground" } });
  pathsLayer = new GraphicsLayer({ elevationInfo: { mode: "relative-to-ground" } });
  map.add(planesLayer);
  map.add(pathsLayer);
}

// export function parseMLATmessage(msg: Cat10) {
//   if (planeMap.has(msg.target_address)) {
//     planeMap.get(msg.target_address)?.mlat_msgs.push(msg);
//   } else {
//     console.log("Target address of MLAT not in planes.");
//     mlatTI.push(msg.target_identification);
//   }
// }

// export function deleteMLATmessage(msg: Cat10) {
//   if (planeMap.has(msg.target_address)) {
//     const l = planeMap.get(msg.target_address)?.mlat_msgs;
//     l?.splice(l.indexOf(msg));
//   }
// }

export function parseADSBmessage(msg: Cat21) {
  if (planeMap.has(msg.target_address)) {
    planeMap.get(msg.target_address)?.adsb_msgs.push(msg);
    if (msg.target_address === selectedPlane) {
      updatePlane(msg);
    }
    //updatePath(msg);
  } else {
    const newPlaneEvent = new CustomEvent("new-plane", { detail: msg });
    elem.dispatchEvent(newPlaneEvent);
    if (!msg.wgs_84_coordinates) return;
    let geometric_height = 0;
    let level = 0;
    let heading = 0;
    // if (msg.geometric_height) {
    //   geometric_height = parseFloat(msg.geometric_height.substring(0, msg.geometric_height.length - 3));
    // }
    // if (msg.flight_level) {
    //   level = parseFloat(msg.flight_level.substring(2));
    // }
    // if (msg.airborne_ground_vector) {
    //   heading = parseFloat(
    //     msg.airborne_ground_vector.TrackAngle.substring(0, msg.airborne_ground_vector.TrackAngle.length - 4)
    //   );
    // }

    const newPlane: Plane = {
      longitude: 0,
      latitude: 0,
      level,
      geometric_height,
      // mlat_msgs: [],
      adsb_msgs: [msg],
      target_identification: msg.target_identification,
      target_address: msg.target_address,
      heading,
      graphic: undefined,
      pathGraphic: undefined,
    };

    planeMap.set(newPlane.target_address, newPlane);

    //    createPlane(newPlane.target_address);
  }
}

export function deleteADSBmessage(msg: Cat21) {
  if (planeMap.has(msg.target_address)) {
    const l = planeMap.get(msg.target_address)!.adsb_msgs;
    l?.splice(l.indexOf(msg));
    if (l.length == 0) {
      const newPlaneEvent = new CustomEvent("del-plane", { detail: msg });
      elem.dispatchEvent(newPlaneEvent);
      deletePlane(planeMap.get(msg.target_address)!);
      return;
    }
    if (selectedPlane === msg.target_address) {
      deleteupdatePlane(l[l.length - 1]);
    }
  }
}

function createPlane(target_address: string) {
  const plane = planeMap.get(target_address)!;
  const msg = plane.adsb_msgs[plane.adsb_msgs.length - 1];
  if (!msg) return;
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
    const h = calculateHeading(plane);
    heading = h == -1 ? plane.heading : h;
  }

  plane.latitude = msg.wgs_84_coordinates.latitude;
  plane.longitude = msg.wgs_84_coordinates.longitude;
  plane.geometric_height = geometric_height;
  plane.level = level;
  plane.heading = heading;

  const newPoint = new Point({
    spatialReference: SpatialReference.WGS84,
    latitude: plane.latitude,
    longitude: plane.longitude,
    hasZ: true,
    z: plane.geometric_height * 0.3048,
  });

  const newGraphic = new Graphic({
    geometry: newPoint,
    popupTemplate: popupTemplate,
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
      target_address: plane.target_address,
      latitude: Math.round(10000 * plane.latitude) / 10000,
      longitude: Math.round(10000 * plane.longitude) / 10000,
      FL: `FL${plane.level}`,
      height: `${plane.geometric_height} ft`,
      heading: `${plane.heading}º`,
    },
  });

  const paths: number[][][] = [[[]]];

  plane.adsb_msgs.forEach((v) => {
    if (!v.wgs_84_coordinates) return;
    let geometric_height = 0;
    if (v.geometric_height) {
      geometric_height = parseFloat(v.geometric_height.substring(0, v.geometric_height.length - 3));
    }

    paths[0].push([v.wgs_84_coordinates.longitude, v.wgs_84_coordinates.latitude, geometric_height * 0.3048]);
  });
  paths[0].shift();

  const newPath = new Polyline({ paths, hasZ: true });

  const newPathGraphic = new Graphic({
    geometry: newPath,
    symbol: pathsymbol,
  });

  plane.graphic = newGraphic;
  plane.pathGraphic = newPathGraphic;
  planesLayer.add(plane.graphic);
  pathsLayer.add(plane.pathGraphic);
}

function updatePlane(msg: Cat21) {
  const plane = planeMap.get(msg.target_address)!;

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
    const h = calculateHeading(plane);
    heading = h == -1 ? plane.heading : h;
  }

  plane.latitude = msg.wgs_84_coordinates.latitude;
  plane.longitude = msg.wgs_84_coordinates.longitude;
  plane.geometric_height = geometric_height;
  plane.level = level;
  plane.heading = heading;

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
  graphic.attributes = {
    target_identification: plane.target_identification,
    target_address: plane.target_address,
    latitude: Math.round(10000 * plane.latitude) / 10000,
    longitude: Math.round(10000 * plane.longitude) / 10000,
    FL: `FL${plane.level}`,
    height: `${plane.geometric_height} ft`,
    heading: `${plane.heading}º`,
  };
}

function updatePath(msg: Cat21) {
  const plane = planeMap.get(msg.target_address)!;

  if (!msg.wgs_84_coordinates) return;
  let geometric_height = 0;
  if (msg.geometric_height) {
    geometric_height = parseFloat(msg.geometric_height.substring(0, msg.geometric_height.length - 3));
  }

  const newPoint = new Point({
    spatialReference: SpatialReference.WGS84,
    latitude: msg.wgs_84_coordinates.latitude,
    longitude: msg.wgs_84_coordinates.longitude,
    hasZ: true,
    z: geometric_height * 0.3048,
  });

  if (!plane.pathGraphic) {
    const newPath = new Polyline({ paths: [[]], hasZ: true });
    const newPathGraphic = new Graphic({
      geometry: newPath,
      symbol: pathsymbol,
    });
    plane.pathGraphic = newPathGraphic;
    pathsLayer.add(plane.pathGraphic);
  }

  const poly = plane.pathGraphic?.geometry as Polyline;
  poly.paths[0].push([newPoint.x, newPoint.y, newPoint.z]);

  const newPath = new Polyline({ paths: poly.paths, hasZ: true });

  plane.pathGraphic!.geometry = newPath;
}

function deleteupdatePlane(msg: Cat21) {
  const plane = planeMap.get(msg.target_address)!;

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
    const h = calculateHeading(plane);
    heading = h == -1 ? plane.heading : h;
  }

  plane.latitude = msg.wgs_84_coordinates.latitude;
  plane.longitude = msg.wgs_84_coordinates.longitude;
  plane.geometric_height = geometric_height;
  plane.level = level;
  plane.heading = heading;

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
  poly.paths[0].splice(poly.paths[0].length - 1, 1);

  const newPath = new Polyline({ paths: poly.paths, hasZ: true });

  plane.pathGraphic!.geometry = newPath;
  graphic.geometry = newPoint;
  graphic.symbol = newSymbol;
  graphic.attributes = {
    target_identification: plane.target_identification,
    target_address: plane.target_address,
    latitude: Math.round(10000 * plane.latitude) / 10000,
    longitude: Math.round(10000 * plane.longitude) / 10000,
    FL: `FL${plane.level}`,
    height: `${plane.geometric_height} ft`,
    heading: `${plane.heading}º`,
  };
}

export function shortenPath(msg: Cat21) {
  const plane = planeMap.get(msg.target_address)!;

  if (!plane) return;
  plane.adsb_msgs.shift();
  if (selectedPlane === msg.target_address) {
    const poly = plane.pathGraphic?.geometry as Polyline;
    poly.paths[0].splice(0, 1);
    const newPath = new Polyline({ paths: poly.paths, hasZ: true });
    plane.pathGraphic!.geometry = newPath;
  }
}

export function addPath(msg: Cat21) {
  const plane = planeMap.get(msg.target_address)!;
  if (!plane) return;
  plane.adsb_msgs = [msg].concat(plane.adsb_msgs);

  if (selectedPlane === msg.target_address) {
    let geometric_height = 0;

    if (msg.geometric_height) {
      geometric_height = parseFloat(msg.geometric_height.substring(0, msg.geometric_height.length - 3));
    }

    const poly = plane.pathGraphic?.geometry as Polyline;
    const path = [[msg.wgs_84_coordinates.longitude, msg.wgs_84_coordinates.latitude, geometric_height]].concat(
      poly.paths[0]
    );

    const newPath = new Polyline({ paths: [path], hasZ: true });

    plane.pathGraphic!.geometry = newPath;
  }
}

export function deletePlane(plane: Plane) {
  if (selectedPlane === plane.target_address) selectedPlane = null;
  removePlane(plane);
  planeMap.delete(plane.target_address);
}

//only call this from exterior
// export function addPlane(plane: Plane) {
//   if (planeMap.has(plane.id)) {
//     graphicsLayer.add(planeMap.get(plane.id)!.graphic!);
//   } else createPlane(plane);
// }

function removePlane(plane: Plane) {
  if (planeMap.has(plane.target_address)) {
    planesLayer.remove(plane.graphic!);
    pathsLayer.remove(plane.pathGraphic!);
  }
}

function calculateHeading(plane: Plane) {
  if (!plane.adsb_msgs[plane.adsb_msgs.length - 2]) return -1;
  const origin = plane.adsb_msgs[plane.adsb_msgs.length - 2].wgs_84_coordinates_high;
  const destination = plane.adsb_msgs[plane.adsb_msgs.length - 1].wgs_84_coordinates_high;
  if (!(origin && destination)) return 0;
  return getRhumbLineBearing(
    { latitude: origin.latitude, longitude: origin.longitude },
    { latitude: destination.latitude, longitude: destination.longitude }
  );
}

export function clearGraphicsLayer() {
  planesLayer.removeAll();
  pathsLayer.removeAll();
  planeMap.clear();
  const newPlaneEvent = new Event("clear-plane");
  elem.dispatchEvent(newPlaneEvent);
}

export function setPlanesLayerVisibility(b: boolean) {
  planesLayer.visible = b;
}

export function setPathsLayerVisibility(b: boolean) {
  pathsLayer.visible = b;
}

export function flyToPlane(target_address: string) {
  if (planeMap.has(target_address)) {
    const msgs = planeMap.get(target_address)!.adsb_msgs!;
    const msg = msgs[msgs.length - 1];
    let geometric_height = 0;

    if (msg.geometric_height) {
      geometric_height = parseFloat(msg.geometric_height.substring(0, msg.geometric_height.length - 3));
      flyTo(
        new Point({
          latitude: msg.wgs_84_coordinates.latitude,
          longitude: msg.wgs_84_coordinates.longitude,
          z: geometric_height * 0.3048,
        })
      );
    }
  }
}

export function selectPlane(target_address: string) {
  if (selectedPlane) {
    if (planeMap.has(selectedPlane)) {
      removePlane(planeMap.get(selectedPlane)!);
    }
  }

  selectedPlane = target_address;
  createPlane(target_address);
}

export function unselectPlane() {
  if (selectedPlane) {
    if (planeMap.has(selectedPlane)) {
      removePlane(planeMap.get(selectedPlane)!);
    }
  }
  selectedPlane = null;
}

export function seeAll() {
  const newPlaneEvent = new CustomEvent("unsel");
  elem.dispatchEvent(newPlaneEvent);
  unselectPlane();
  planeMap.forEach((v, k) => {
    createPlane(k);
  });
}

export function clearSeeAll() {
  planesLayer.removeAll();
  pathsLayer.removeAll();
}
