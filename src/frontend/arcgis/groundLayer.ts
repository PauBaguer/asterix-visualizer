import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";

import type ArcGISMap from "@arcgis/core/Map";
import type { Cat10 } from "../custom-types/asterix/cat10";
import type { Cat21 } from "../custom-types/asterix/cat21";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import { computeDestinationPoint } from "geolib";
import type SceneView from "@arcgis/core/views/SceneView";
import Sketch from "@arcgis/core/widgets/Sketch";

let groundLayerSmr: GraphicsLayer;
let groundLayerMlat: GraphicsLayer;
let groundLayerAdsb: GraphicsLayer;

const popupTemplateSMR = {
  title: "SMR point {id}",
  content: [
    {
      type: "fields",
      fieldInfos: [
        {
          fieldName: "id",
          label: "Id",
        },
        {
          fieldName: "class",
          label: "Class",
        },
        {
          fieldName: "instrument",
          label: "Instrument",
        },
        {
          fieldName: "time_of_day",
          label: "Time Of Day",
        },
        {
          fieldName: "data_source_identifier",
          label: "Data Source Identifier",
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
          fieldName: "cartesian_coordinate_x",
          label: "Cartesian Coordinate X",
        },
        {
          fieldName: "cartesian_coordinate_y",
          label: "Cartesian Coordinate Y",
        },
        {
          fieldName: "polar_coordinates_r",
          label: "Polar Coordinate R",
        },
        {
          fieldName: "polar_coordinates_theta",
          label: "Polar Coordinate Theta",
        },
      ],
    },
  ],
};

const popupTemplateMLAT = {
  title: "MLAT point {id}",
  content: [
    {
      type: "fields",
      fieldInfos: [
        {
          fieldName: "id",
          label: "Id",
        },
        {
          fieldName: "class",
          label: "Class",
        },
        {
          fieldName: "instrument",
          label: "Instrument",
        },
        {
          fieldName: "time_of_day",
          label: "Time Of Day",
        },
        {
          fieldName: "target_address",
          label: "Target Address",
        },
        {
          fieldName: "data_source_identifier",
          label: "Data Source Identifier",
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
          fieldName: "cartesian_coordinate_x",
          label: "Cartesian Coordinate X",
        },
        {
          fieldName: "cartesian_coordinate_y",
          label: "Cartesian Coordinate Y",
        },
        {
          fieldName: "track_number",
          label: "Track Number",
        },
      ],
    },
  ],
};

const popupTemplateADSB = {
  title: "ADS-B point {id} from {target_identification}",
  content: [
    {
      type: "fields",
      fieldInfos: [
        {
          fieldName: "id",
          label: "Id",
        },
        {
          fieldName: "class",
          label: "Class",
        },
        {
          fieldName: "instrument",
          label: "Instrument",
        },
        {
          fieldName: "time_ASTERIX_report_transmission",
          label: "Time of ASTERIX report transmission",
        },
        {
          fieldName: "target_identification",
          label: "Target Identification",
        },
        {
          fieldName: "target_address",
          label: "Target Address",
        },
        {
          fieldName: "data_source_identifier",
          label: "Data Source Identifier",
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
          fieldName: "flight_level",
          label: "Flight Level",
        },
        {
          fieldName: "geometric_height",
          label: "Geometric Height",
        },
      ],
    },
  ],
};

const graphicMap: Map<number, Graphic> = new Map();

const symbolConstSMR = new SimpleMarkerSymbol({
  style: "circle",
  color: "#fe0000",
});

const symbolConstMLAT = new SimpleMarkerSymbol({
  style: "circle",
  color: "#ffeb16",
});

const symbolSMR = new SimpleMarkerSymbol({
  style: "circle",
  color: "#fe0000",
  size: 4,
});

const symbolMLAT = new SimpleMarkerSymbol({
  style: "circle",
  color: "#ffeb16",
  size: 4,
});

const symbolADSB = new SimpleMarkerSymbol({
  style: "circle",
  color: "#6733bb",
  size: 4,
});

export function loadGroundLayer(map: ArcGISMap) {
  const graphicsmr = new Graphic({
    geometry: new Point({
      latitude: 41.29561833,
      longitude: 2.095114167,
    }),
    symbol: symbolConstSMR,
    attributes: { sic: 7 },
    popupTemplate: {
      title: "LEBL SMR Instrument",
      content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "sic",
              label: "SIC",
            },
          ],
        },
      ],
    },
  });

  const graphicmlat = new Graphic({
    geometry: new Point({ latitude: 41.29706278, longitude: 2.078447222 }),
    symbol: symbolConstMLAT,
    attributes: { sic: 107 },
    popupTemplate: {
      title: "LEBL MLAT Logical Reference Point",
      content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "sic",
              label: "SIC",
            },
          ],
        },
      ],
    },
  });

  groundLayerSmr = new GraphicsLayer({ elevationInfo: { mode: "on-the-ground" } });
  groundLayerMlat = new GraphicsLayer({ elevationInfo: { mode: "on-the-ground" } });
  groundLayerAdsb = new GraphicsLayer({ elevationInfo: { mode: "on-the-ground" } });

  const constLayer = new GraphicsLayer();
  constLayer.elevationInfo = { mode: "on-the-ground" };

  constLayer.addMany([graphicsmr, graphicmlat]);
  // let sketch = new Sketch({
  //   layer: constLayer,
  //   view: view,
  // });

  // sketch.on("create", function (event) {
  //   // check if the create event's state has changed to complete indicating
  //   // the graphic create operation is completed.
  //   if (event.state === "complete") {
  //     // remove the graphic from the layer. Sketch adds
  //     // the completed graphic to the layer by default.
  //     console.log(event.graphic);
  //   }
  // });

  // view.ui.add(sketch, { position: "top-right" });

  map.add(groundLayerSmr);
  map.add(groundLayerMlat);
  map.add(groundLayerAdsb);
  map.add(constLayer);
}

export function createGraphicSMR(msg: Cat10) {
  if (!msg.cartesian_coordinates) return;

  const target_pos = computeDestinationPoint(
    { latitude: 41.29561833, longitude: 2.095114167 },
    msg.polar_coordinates.r,
    msg.polar_coordinates.theta
  );
  const newPoint = new Point({
    spatialReference: SpatialReference.WGS84,
    latitude: target_pos.latitude,
    longitude: target_pos.longitude,
  });

  const newGraphic = new Graphic({
    geometry: newPoint,
    symbol: symbolSMR,
    popupTemplate: popupTemplateSMR,
    attributes: {
      id: msg.id,
      class: msg.class,
      instrument: msg.instrument,
      time_of_day: new Date(msg.time_of_day * 1000).toISOString().substring(11, 23),
      data_source_identifier: `SIC: ${msg.data_source_identifier.SIC}; SAC: ${msg.data_source_identifier.SAC}`,
      cartesian_coordinate_x: `${msg.cartesian_coordinates.x}`,
      cartesian_coordinate_y: `${msg.cartesian_coordinates.y}`,
      polar_coordinates_r: `${msg.polar_coordinates.r}`,
      polar_coordinates_theta: `${msg.polar_coordinates.theta}`,
      latitude: target_pos.latitude,
      longitude: target_pos.longitude,
    },
  });

  graphicMap.set(msg.id, newGraphic);
  groundLayerSmr.add(newGraphic);
}

export function createGraphicMLAT(msg: Cat10) {
  if (!msg.cartesian_coordinates) return;

  const target_pos = computeDestinationPoint(
    { latitude: 41.29706278, longitude: 2.078447222 },
    Math.sqrt(Math.pow(msg.cartesian_coordinates.x, 2) + Math.pow(msg.cartesian_coordinates.y, 2)),
    (Math.atan2(msg.cartesian_coordinates.x, msg.cartesian_coordinates.y) * 180) / Math.PI
  );
  const newPoint = new Point({
    spatialReference: SpatialReference.WGS84,
    latitude: target_pos.latitude,
    longitude: target_pos.longitude,
  });

  const newGraphic = new Graphic({
    geometry: newPoint,
    symbol: symbolMLAT,
    popupTemplate: popupTemplateMLAT,
    attributes: {
      id: msg.id,
      class: msg.class,
      instrument: msg.instrument,
      time_of_day: new Date(msg.time_of_day * 1000).toISOString().substring(11, 23),
      target_address: msg.target_address,
      data_source_identifier: `SIC: ${msg.data_source_identifier.SIC}; SAC: ${msg.data_source_identifier.SAC}`,
      cartesian_coordinate_x: `${msg.cartesian_coordinates.x}`,
      cartesian_coordinate_y: `${msg.cartesian_coordinates.y}`,
      track_number: msg.track_number,

      latitude: target_pos.latitude,
      longitude: target_pos.longitude,
    },
  });
  graphicMap.set(msg.id, newGraphic);
  groundLayerMlat.add(newGraphic);
}

export function createGraphicADSB(msg: Cat21) {
  if (!msg.wgs_84_coordinates) return;

  const newPoint = new Point({
    spatialReference: SpatialReference.WGS84,
    latitude: msg.wgs_84_coordinates.latitude,
    longitude: msg.wgs_84_coordinates.longitude,
  });

  const newGraphic = new Graphic({
    geometry: newPoint,
    symbol: symbolADSB,
    popupTemplate: popupTemplateADSB,
    attributes: {
      id: msg.id,
      class: msg.class,
      instrument: msg.instrument,
      time_ASTERIX_report_transmission: new Date(msg.time_ASTERIX_report_transmission * 1000)
        .toISOString()
        .substring(11, 23),
      target_address: msg.target_address,
      target_identification: msg.target_identification,
      data_source_identifier: `SIC: ${msg.data_source_identifier.SIC}; SAC: ${msg.data_source_identifier.SAC}`,
      barometric_vertical_rate: msg.barometric_vertical_rate,
      flight_level: msg.flight_level,
      geometric_height: msg.geometric_height,
      latitude: msg.wgs_84_coordinates.latitude,
      longitude: msg.wgs_84_coordinates.longitude,
    },
  });
  graphicMap.set(msg.id, newGraphic);
  groundLayerAdsb.add(newGraphic);
}

export function setSMRVisibility(b: boolean) {
  groundLayerSmr.visible = b;
}

export function setMLATVisibility(b: boolean) {
  groundLayerMlat.visible = b;
}

export function setADSBVisibility(b: boolean) {
  groundLayerAdsb.visible = b;
}

export function deleteGraphicSMR(msg: Cat10 | Cat21) {
  if (graphicMap.has(msg.id)) {
    groundLayerSmr.remove(graphicMap.get(msg.id)!);
    graphicMap.delete(msg.id);
  }
}

export function deleteGraphicMLAT(msg: Cat10 | Cat21) {
  if (graphicMap.has(msg.id)) {
    groundLayerMlat.remove(graphicMap.get(msg.id)!);
    graphicMap.delete(msg.id);
  }
}

export function deleteGraphicADSB(msg: Cat10 | Cat21) {
  if (graphicMap.has(msg.id)) {
    groundLayerAdsb.remove(graphicMap.get(msg.id)!);
    graphicMap.delete(msg.id);
  }
}

export function clearMap() {
  groundLayerSmr.removeAll();
  groundLayerMlat.removeAll();
  groundLayerAdsb.removeAll();
  graphicMap.clear();
}
