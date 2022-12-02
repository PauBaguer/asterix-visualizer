import { isPointInPolygon } from "geolib";

//from

// export function loadAreasLayer(map: ArcGISMap) {
//     const rwy06R = new Graphic({
//       symbol: fillSymbolRWY,
//       geometry: new Polygon({
//         rings: [
//           [
//             [2.073544428747862, 41.282322777493, 0],
//             [2.1038044835174534, 41.292695924731504, 0],
//             [2.104090847313795, 41.29222048305417, 0],
//             [2.07382476073992, 41.28186917069003, 0],
//             [2.073544428747862, 41.282322777493, 0],
//           ],
//         ],
//       }),
//     });

// to

const poly = [
  { longitude: 2.073544428747862, latitude: 41.282322777493 },
  { longitude: 2.1038044835174534, latitude: 41.292695924731504 },
  { longitude: 2.104090847313795, latitude: 41.29222048305417 },
  { longitude: 2.07382476073992, latitude: 41.28186917069003 },
  { longitude: 2.073544428747862, latitude: 41.282322777493 },
];

isPointInPolygon({ latitude: 42, longitude: 2 }, poly);
