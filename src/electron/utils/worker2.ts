import { computeDestinationPoint, getDistance } from "geolib";
import { workerData, parentPort } from "node:worker_threads";
import { Cat10 } from "../asterix/cat10_decoder";
import { Cat21, WGS_84_coordinates } from "../asterix/cat21_decoder";
import { classifyMessages as decodeMessages } from "../asterix/message_cassifier";
import { getAreaLayerPoint } from "./mlatAreas";

let messages: (Cat10 | Cat21)[] = [];
let started = false;
parentPort?.on("message", (data) => {
  messages = messages.concat(data);

  if (!started && workerData.messagesLength === messages.length) {
    doStuff();
    parentPort?.close();
  }
});

async function doStuff() {
  messages = messages.filter((v) => v.instrument !== "SMR");
  const id = probIdentification();
  const accuracy_parameters = computeAccuracy();
  parentPort?.postMessage({ id, accuracy_parameters });
}

export function probIdentification() {
  let hash: Map<String, HashObject> = new Map();
  let rwy24l = 0,
    rwy24r = 0,
    rwy2 = 0,
    apronT1 = 0,
    apronT2 = 0,
    taxi = 0,
    standT1 = 0,
    standT2 = 0,
    airbone2 = 0,
    airbone5 = 0,
    airbone10 = 0;
  let rwy24l_f = 0,
    rwy24r_f = 0,
    rwy2_f = 0,
    apronT1_f = 0,
    apronT2_f = 0,
    taxi_f = 0,
    standT1_f = 0,
    standT2_f = 0,
    airbone2_f = 0,
    airbone5_f = 0,
    airbone10_f = 0;
  const sec = 5;
  messages.forEach((msg: Cat10 | Cat21) => {
    if (
      msg.instrument === "MLAT" &&
      msg.message_type === "Target Report" &&
      msg.target_report_description.TOT === "Aircraft" &&
      msg.target_identification !== undefined &&
      msg.cartesian_coordinates !== undefined
    ) {
      const target_pos = computeDestinationPoint(
        { latitude: 41.29706278, longitude: 2.078447222 },
        Math.sqrt(Math.pow(msg.cartesian_coordinates.x, 2) + Math.pow(msg.cartesian_coordinates.y, 2)),
        (Math.atan2(msg.cartesian_coordinates.x, msg.cartesian_coordinates.y) * 180) / Math.PI
      );
      const zone = getAreaLayerPoint(target_pos.latitude, target_pos.longitude);
      const ta = msg.target_address;
      let res = hash.get(ta);
      if (res !== undefined) {
        if (res?.target_identification === msg.target_identification.target_identification) {
          while (msg.time_of_day >= res.time + sec) {
            switch (zone) {
              case "RWY24L":
                rwy24l++;
                break;
              case "RWY24R":
                rwy24r++;
                break;
              case "RWY02":
                rwy2++;
                break;
              case "ApronT1":
                apronT1++;
                break;
              case "ApronT2":
                apronT2++;
                break;
              case "Taxi":
                taxi++;
                break;
              case "StandT1":
                standT1++;
                break;
              case "StandT2":
                standT2++;
                break;
              case "Airbone2.5":
                airbone2++;
                break;
              case "Airbone5":
                airbone5++;
                break;
              case "Airbone10":
                airbone10++;
                break;
            }
            res.time += sec;
            res.false_detection = false;
          }
          hash.set(ta, res);
        } else {
          if (res?.time + sec > msg.time_of_day) {
            if (!res.false_detection) {
              switch (zone) {
                case "RWY24L":
                  rwy24l_f++;
                  break;
                case "RWY24R":
                  rwy24r_f++;
                  break;
                case "RWY02":
                  rwy2_f++;
                  break;
                case "ApronT1":
                  apronT1_f++;
                  break;
                case "ApronT2":
                  apronT2_f++;
                  break;
                case "Taxi":
                  taxi_f++;
                  break;
                case "StandT1":
                  standT1_f++;
                  break;
                case "StandT2":
                  standT2_f++;
                  break;
                case "Airbone2.5":
                  airbone2_f++;
                  break;
                case "Airbone5":
                  airbone5_f++;
                  break;
                case "Airbone10":
                  airbone10_f++;
                  break;
              }
              res.false_detection = true;
              hash.set(ta, res);
            }
          } else {
            switch (zone) {
              case "RWY24L":
                rwy24l++;
                break;
              case "RWY24R":
                rwy24r++;
                break;
              case "RWY02":
                rwy2++;
                break;
              case "ApronT1":
                apronT1++;
                break;
              case "ApronT2":
                apronT2++;
                break;
              case "Taxi":
                taxi++;
                break;
              case "StandT1":
                standT1++;
                break;
              case "StandT2":
                standT2++;
                break;
              case "Airbone2.5":
                airbone2++;
                break;
              case "Airbone5":
                airbone5++;
                break;
              case "Airbone10":
                airbone10++;
                break;
            }
            hash.set(ta, {
              target_identification: msg.target_identification.target_identification,
              time: msg.time_of_day,
              false_detection: false,
            });
          }
        }
      } else {
        hash.set(ta, {
          target_identification: msg.target_identification.target_identification,
          time: msg.time_of_day,
          false_detection: false,
        });
        switch (zone) {
          case "RWY24L":
            rwy24l++;
            break;
          case "RWY24R":
            rwy24r++;
            break;
          case "RWY02":
            rwy2++;
            break;
          case "ApronT1":
            apronT1++;
            break;
          case "ApronT2":
            apronT2++;
            break;
          case "Taxi":
            taxi++;
            break;
          case "StandT1":
            standT1++;
            break;
          case "StandT2":
            standT2++;
            break;
          case "Airbone2.5":
            airbone2++;
            break;
          case "Airbone5":
            airbone5++;
            break;
          case "Airbone10":
            airbone10++;
            break;
        }
      }
    }
  });

  let prob_identification = {
    RWY24L: { Total: rwy24l, False: rwy24l_f },
    RWY24R: { Total: rwy24r, False: rwy24r_f },
    RWY02: { Total: rwy2, False: rwy2_f },
    Taxi: { Total: taxi, False: taxi_f },
    ApronT1: { Total: apronT1, False: apronT1_f },
    ApronT2: { Total: apronT2, False: apronT2_f },
    StandT1: { Total: standT1, False: standT1_f },
    StandT2: { Total: standT2, False: standT2_f },
    Airbone2: { Total: airbone2, False: airbone2_f },
    Airbone5: { Total: airbone5, False: airbone5_f },
    Airbone10: { Total: airbone10, False: airbone10_f },
  };
  return prob_identification;
}

export interface HashObject {
  target_identification: String;
  time: number;
  false_detection: boolean;
}

export interface ProbIdentification {
  RWY24L: Counter;
  RWY24R: Counter;
  RWY02: Counter;
  Taxi: Counter;
  ApronT1: Counter;
  ApronT2: Counter;
  StandT1: Counter;
  StandT2: Counter;
  Airbone2: Counter;
  Airbone5: Counter;
  Airbone10: Counter;
}

interface Counter {
  Total: number;
  False: number;
}

export interface AccuracyResults {
  RWY24L_95max: number;
  RWY24L_99max: number;
  RWY24L_average: number;
  RWY24L_std: number;

  RWY24R_95max: number;
  RWY24R_99max: number;
  RWY24R_average: number;
  RWY24R_std: number;

  RWY2_95max: number;
  RWY2_99max: number;
  RWY2_average: number;
  RWY2_std: number;

  Taxi_95max: number;
  Taxi_99max: number;
  Taxi_average: number;
  Taxi_std: number;

  ApronT1_95max: number;
  ApronT1_99max: number;
  ApronT1_average: number;
  ApronT1_std: number;

  ApronT2_95max: number;
  ApronT2_99max: number;
  ApronT2_average: number;
  ApronT2_std: number;

  Airbone2_95max: number;
  Airbone2_average: number;
  Airbone2_std: number;

  Airbone5_95max: number;
  Airbone5_average: number;
  Airbone5_std: number;

  StandT1_max: number;
  StandT1_average: number;
  StandT1_std: number;

  StandT2_max: number;
  StandT2_average: number;
  StandT2_std: number;

  Maneouvering_95max: number;
  Maneouvering_99max: number;
  Maneouvering_average: number;
  Maneouvering_std: number;

  Apron_95max: number;
  Apron_99max: number;
  Apron_average: number;
  Apron_std: number;

  Stand_max: number;
  Stand_average: number;
  Stand_std: number;
}

export interface HashObjectA {
  timeMLAT: number;
  coordsMLAT: WGS_84_coordinates;
  timeADSB: number;
  coordsADSB: WGS_84_coordinates;
}

export interface Accuracy {
  RWY: number[];
  Apron: number[];
  Taxi: number[];
  Stand: number[];
  Airbone: number[];
}

export function computeAccuracy() {
  const max_windows_sec = 0.05;
  const min_Pic = 9;
  let hash: Map<String, HashObjectA> = new Map();
  let rwy24l: number[] = [],
    rwy24r: number[] = [],
    rwy2: number[] = [],
    apronT1: number[] = [],
    apronT2: number[] = [],
    taxi: number[] = [],
    standT1: number[] = [],
    standT2: number[] = [],
    airbone2: number[] = [],
    airbone5: number[] = [],
    airbone10: number[] = [];

  messages.forEach((msg: Cat10 | Cat21) => {
    if (
      msg.instrument === "MLAT" &&
      msg.message_type === "Target Report" &&
      msg.target_report_description.TOT === "Aircraft" &&
      msg.cartesian_coordinates !== undefined
    ) {
      const ta = msg.target_address;
      let res = hash.get(ta);
      const target_pos = computeDestinationPoint(
        { latitude: 41.29706278, longitude: 2.078447222 },
        Math.sqrt(Math.pow(msg.cartesian_coordinates.x, 2) + Math.pow(msg.cartesian_coordinates.y, 2)),
        (Math.atan2(msg.cartesian_coordinates.x, msg.cartesian_coordinates.y) * 180) / Math.PI
      );
      if (res !== undefined) {
        if (res?.timeADSB !== 0) {
          const timebefore = res?.timeADSB - res?.timeMLAT;
          const timeafter = msg.time_of_day - res?.timeADSB;

          if (timebefore <= max_windows_sec || timeafter <= max_windows_sec) {
            // Otherwise to much time between messages, descart and save current msg
            let mesure = 0;

            if (timebefore < timeafter) {
              // Compute with the past msg
              mesure = getDistance(res?.coordsMLAT, res?.coordsADSB, 0.01);
            } else {
              // compute with the new
              mesure = getDistance(target_pos, res?.coordsADSB, 0.01);
            }
            const zone = getAreaLayerPoint(target_pos.latitude, target_pos.longitude);
            switch (zone) {
              case "RWY24L":
                rwy24l.push(mesure);
                break;
              case "RWY24R":
                rwy24r.push(mesure);
                break;
              case "RWY02":
                rwy2.push(mesure);
                break;
              case "ApronT1":
                apronT1.push(mesure);
                break;
              case "ApronT2":
                apronT2.push(mesure);
                break;
              case "Taxi":
                taxi.push(mesure);
                break;
              case "StandT1":
                standT1.push(mesure);
                break;
              case "StandT2":
                standT2.push(mesure);
                break;
              case "Airbone2.5":
                airbone2.push(mesure);
                break;
              case "Airbone5":
                airbone5.push(mesure);
                break;
            }
          }
        }
      }
      hash.set(ta, {
        timeMLAT: msg.time_of_day,
        coordsMLAT: target_pos,
        timeADSB: 0,
        coordsADSB: { latitude: 0, longitude: 0 },
      });
    }
    //@ts-ignore
    if (msg.instrument === "ADS-B" && msg.wgs_84_coordinates !== undefined && msg.Pic_accuracy >= min_Pic) {
      const ta = msg.target_address;
      let res = hash.get(ta);

      if (res !== undefined) {
        if (res?.timeMLAT !== 0 && res?.timeADSB !== 0 && res?.timeADSB - res?.timeMLAT <= max_windows_sec) {
          //compute
          const mesure = getDistance(res?.coordsMLAT, res?.coordsADSB, 0.01);
          const zone = getAreaLayerPoint(res?.coordsADSB.latitude, res?.coordsADSB.longitude);
          switch (zone) {
            case "RWY24L":
              rwy24l.push(mesure);
              break;
            case "RWY24R":
              rwy24r.push(mesure);
              break;
            case "RWY02":
              rwy2.push(mesure);
              break;
            case "ApronT1":
              apronT1.push(mesure);
              break;
            case "ApronT2":
              apronT2.push(mesure);
              break;
            case "Taxi":
              taxi.push(mesure);
              break;
            case "StandT1":
              standT1.push(mesure);
              break;
            case "StandT2":
              standT2.push(mesure);
              break;
            case "Airbone2.5":
              airbone2.push(mesure);
              break;
            case "Airbone5":
              airbone5.push(mesure);
              break;
          }
        } else {
          //@ts-ignore
          hash.set(ta, {
            timeMLAT: res?.timeMLAT,
            coordsMLAT: res?.coordsMLAT,
            //@ts-ignore
            timeADSB: msg.time_ASTERIX_report_transmission,
            coordsADSB: msg.wgs_84_coordinates,
          });
        }
      } else {
        //@ts-ignore
        hash.set(ta, {
          timeMLAT: 0,
          coordsMLAT: { latitude: 0, longitude: 0 },
          //@ts-ignore
          timeADSB: msg.time_ASTERIX_report_transmission,
          coordsADSB: msg.wgs_84_coordinates,
        });
      }
    }
  });

  rwy24l = rwy24l
    .sort(function (a, b) {
      return b - a;
    })
    .slice(Math.round(rwy24l.length * 0.2));
  const rwy24L_95 = rwy24l.slice(Math.round(rwy24l.length * 0.05))[0];
  const rwy24L_99 = rwy24l.slice(Math.round(rwy24l.length * 0.01))[0];
  const rwy24L_average = rwy24l.reduce((partialSum, a) => partialSum + a, 0) / rwy24l.length;
  const rwy24L_std = Math.sqrt(
    rwy24l.reduce((partialSum, a) => partialSum + Math.pow(a - rwy24L_average, 2), 0) / rwy24l.length
  );

  rwy24r = rwy24r
    .sort(function (a, b) {
      return b - a;
    })
    .slice(Math.round(rwy24r.length * 0.1));
  const rwy24R_95 = rwy24r.slice(Math.round(rwy24r.length * 0.05))[0];
  const rwy24R_99 = rwy24r.slice(Math.round(rwy24r.length * 0.01))[0];
  const rwy24R_average = rwy24r.reduce((partialSum, a) => partialSum + a, 0) / rwy24r.length;
  const rwy24R_std = Math.sqrt(
    rwy24r.reduce((partialSum, a) => partialSum + Math.pow(a - rwy24R_average, 2), 0) / rwy24r.length
  );

  rwy2 = rwy2
    .sort(function (a, b) {
      return b - a;
    })
    .slice(Math.round(rwy2.length * 0.1));
  const rwy2_95 = rwy2.slice(Math.round(rwy2.length * 0.05))[0];
  const rwy2_99 = rwy2.slice(Math.round(rwy2.length * 0.01))[0];
  const rwy2_average = rwy2.reduce((partialSum, a) => partialSum + a, 0) / rwy2.length;
  const rwy2_std = Math.sqrt(
    rwy2.reduce((partialSum, a) => partialSum + Math.pow(a - rwy2_average, 2), 0) / rwy2.length
  );

  taxi = taxi
    .sort(function (a, b) {
      return b - a;
    })
    .slice(Math.round(taxi.length * 0.1));
  const taxi_95 = taxi.slice(Math.round(taxi.length * 0.05))[0];
  const taxi_99 = taxi.slice(Math.round(taxi.length * 0.01))[0];
  const taxi_average = taxi.reduce((partialSum, a) => partialSum + a, 0) / taxi.length;
  const taxi_std = Math.sqrt(
    taxi.reduce((partialSum, a) => partialSum + Math.pow(a - taxi_average, 2), 0) / taxi.length
  );

  apronT1 = apronT1
    .sort(function (a, b) {
      return b - a;
    })
    .slice(Math.round(apronT1.length * 0.1));
  const apronT1_95 = apronT1.slice(Math.round(apronT1.length * 0.05))[0];
  const apronT1_99 = apronT1.slice(Math.round(apronT1.length * 0.01))[0];
  const apronT1_average = apronT1.reduce((partialSum, a) => partialSum + a, 0) / apronT1.length;
  const apronT1_std = Math.sqrt(
    apronT1.reduce((partialSum, a) => partialSum + Math.pow(a - apronT1_average, 2), 0) / apronT1.length
  );

  apronT2 = apronT2
    .sort(function (a, b) {
      return b - a;
    })
    .slice(Math.round(apronT2.length * 0.1));
  const apronT2_95 = apronT2.slice(Math.round(apronT2.length * 0.05))[0];
  const apronT2_99 = apronT2.slice(Math.round(apronT2.length * 0.01))[0];
  const apronT2_average = apronT2.reduce((partialSum, a) => partialSum + a, 0) / apronT2.length;
  const apronT2_std = Math.sqrt(
    apronT2.reduce((partialSum, a) => partialSum + Math.pow(a - apronT2_average, 2), 0) / apronT2.length
  );

  const airbone2_95 = airbone2
    .sort(function (a, b) {
      return b - a;
    })
    .slice(Math.round(airbone2.length * 0.05))[0];
  const airbone2_average = airbone2.reduce((partialSum, a) => partialSum + a, 0) / airbone2.length;
  const airbone2_std = Math.sqrt(
    airbone2.reduce((partialSum, a) => partialSum + Math.pow(a - airbone2_average, 2), 0) / airbone2.length
  );

  const airbone5_95 = airbone5
    .sort(function (a, b) {
      return b - a;
    })
    .slice(Math.round(airbone5.length * 0.05))[0];
  const airbone5_average = airbone5.reduce((partialSum, a) => partialSum + a, 0) / airbone5.length;
  const airbone5_std = Math.sqrt(
    airbone5.reduce((partialSum, a) => partialSum + Math.pow(a - airbone5_average, 2), 0) / airbone5.length
  );

  const standT1_max = standT1
    .sort(function (a, b) {
      return b - a;
    })
    .slice(Math.round(standT1.length * 0.05))[0];
  const standT1_average = standT1.reduce((partialSum, a) => partialSum + a, 0) / standT1.length;
  const standT1_std = Math.sqrt(
    standT1.reduce((partialSum, a) => partialSum + Math.pow(a - standT1_average, 2), 0) / standT1.length
  );

  const standT2_max = standT2
    .sort(function (a, b) {
      return b - a;
    })
    .slice(Math.round(standT2.length * 0.05))[0];
  const standT2_average = standT2.reduce((partialSum, a) => partialSum + a, 0) / standT2.length;
  const standT2_std = Math.sqrt(
    standT2.reduce((partialSum, a) => partialSum + Math.pow(a - standT2_average, 2), 0) / standT2.length
  );

  let maneouvering = rwy2.concat(rwy24l, rwy24r);
  maneouvering
    .sort(function (a, b) {
      return b - a;
    })
    .slice(Math.round(maneouvering.length * 0.1));
  const maneouvering_95 = maneouvering.slice(Math.round(maneouvering.length * 0.05))[0];
  const maneouvering_99 = maneouvering.slice(Math.round(maneouvering.length * 0.01))[0];
  const maneouvering_average = maneouvering.reduce((partialSum, a) => partialSum + a, 0) / maneouvering.length;
  const maneouvering_std = Math.sqrt(
    maneouvering.reduce((partialSum, a) => partialSum + Math.pow(a - maneouvering_average, 2), 0) / maneouvering.length
  );

  let apron = apronT1.concat(apronT2);
  apron
    .sort(function (a, b) {
      return b - a;
    })
    .slice(Math.round(apron.length * 0.1));
  const apron_95 = apron.slice(Math.round(apron.length * 0.05))[0];
  const apron_99 = apron.slice(Math.round(apron.length * 0.01))[0];
  const apron_average = apron.reduce((partialSum, a) => partialSum + a, 0) / apron.length;
  const apron_std = Math.sqrt(
    apron.reduce((partialSum, a) => partialSum + Math.pow(a - apron_average, 2), 0) / apron.length
  );

  const stand = standT1.concat(standT2);
  const stand_max = stand
    .sort(function (a, b) {
      return b - a;
    })
    .slice(Math.round(stand.length * 0.05))[0];
  const stand_average = stand.reduce((partialSum, a) => partialSum + a, 0) / stand.length;
  const stand_std = Math.sqrt(
    stand.reduce((partialSum, a) => partialSum + Math.pow(a - stand_average, 2), 0) / stand.length
  );

  let accuracy = {
    RWY24L_95max: rwy24L_95,
    RWY24L_99max: rwy24L_99,
    RWY24L_average: rwy24L_average,
    RWY24L_std: rwy24L_std,

    RWY24R_95max: rwy24R_95,
    RWY24R_99max: rwy24R_99,
    RWY24R_average: rwy24R_average,
    RWY24R_std: rwy24R_std,

    RWY2_95max: rwy2_95,
    RWY2_99max: rwy2_99,
    RWY2_average: rwy2_average,
    RWY2_std: rwy2_std,

    Taxi_95max: taxi_95,
    Taxi_99max: taxi_99,
    Taxi_average: taxi_average,
    Taxi_std: taxi_std,

    ApronT1_95max: apronT1_95,
    ApronT1_99max: apronT1_99,
    ApronT1_average: apronT1_average,
    ApronT1_std: apronT1_std,

    ApronT2_95max: apronT2_95,
    ApronT2_99max: apronT2_99,
    ApronT2_average: apronT2_average,
    ApronT2_std: apronT2_std,

    Airbone2_95max: airbone2_95,
    Airbone2_average: airbone2_average,
    Airbone2_std: airbone2_std,

    Airbone5_95max: airbone5_95,
    Airbone5_average: airbone5_average,
    Airbone5_std: airbone5_std,

    StandT1_max: standT1_max,
    StandT1_average: standT1_average,
    StandT1_std: standT1_std,

    StandT2_max: standT2_max,
    StandT2_average: standT2_average,
    StandT2_std: standT2_std,

    Maneouvering_95max: maneouvering_95,
    Maneouvering_99max: maneouvering_99,
    Maneouvering_average: maneouvering_average,
    Maneouvering_std: maneouvering_std,

    Apron_95max: apron_95,
    Apron_99max: apron_99,
    Apron_average: apron_average,
    Apron_std: apron_std,

    Stand_max: stand_max,
    Stand_average: stand_average,
    Stand_std: stand_std,
  };
  return accuracy;
}
