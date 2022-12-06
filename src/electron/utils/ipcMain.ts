import { Cat10 } from "../asterix/cat10_decoder";
import { Cat21, WGS_84_coordinates } from "../asterix/cat21_decoder";
import { classifyMessages as decodeMessages, sliceMainBuffer } from "../asterix/message_cassifier";
import { openFilePicker } from "./file_management";
import { Worker } from "node:worker_threads";
import { getAreaLayerPoint } from "./mlatAreas";
import computeDestinationPoint from "geolib/es/computeDestinationPoint";
import { getDistance } from "geolib";
import { rmSync } from "node:fs";


let buffer: Buffer | undefined;
let messages: Buffer[];
let decodedMsg: (Cat10 | Cat21)[];
let msgDelivered = 0;
let prob_identification = {
  RWY24L: 0,
  RWY24R: 0,
  RWY02: 0,
  Taxi: 0,
  ApronT1: 0,
  ApronT2: 0,
  StandT1: 0,
  StandT2: 0,
  Airbone2: 0,
  Airbone5: 0,
  Airbone10: 0,
}
let accuracy = { RWY24L_95max: 0, RWY24L_99max: 0, RWY24L_average: 0, RWY24L_std: 0, RWY24R_95max: 0, RWY24R_99max: 0, RWY24R_average: 0, RWY24R_std: 0, RWY2_95max: 0, RWY2_99max: 0, RWY2_average: 0, RWY2_std: 0, apronT1_95max: 0, Taxi_99max: 0, Taxi_average: 0, Taxi_std: 0, ApronT1_95max: 0, ApronT1_99max: 0, ApronT1_average: 0, ApronT1_std: 0, ApronT2_95max: 0, ApronT2_99max: 0, ApronT2_average: 0, ApronT2_std: 0, Airbone2_95max: 0, Airbone2_average: 0, Airbone2_std: 0, Airbone5_95max: 0, Airbone5_average: 0, Airbone5_std: 0, StandT1_max: 0, StandT1_average: 0, StandT1_std: 0, StandT2_max: 0, StandT2_average: 0, StandT2_std: 0 };

export async function loadFileIpc() {
  messages = [];
  decodedMsg = [];
  msgDelivered = 0;
  //const startTime = performance.now();
  buffer = await openFilePicker();
  // const endTime = performance.now();
  // console.log(`Call to openFilePicker took ${endTime - startTime} milliseconds`);

  if (!buffer) {
    console.log("No file opened");
    return;
  }

  messages = await sliceMainBuffer(buffer);
  let L = messages.length > 500000 ? 400000 : messages.length;
  console.log("About to process " + L + " messages.");
  return L;
}

export async function getMessagesIpc(event: any, messageQuantity: number) {
  const startTime = performance.now();
  console.log("Start decoding");
  decodedMsg = await decodeMessages(messages, messageQuantity, 0);
  const endTime = performance.now();
  console.log(`Call to decodeMessages took ${endTime - startTime} milliseconds`);
  const msgToSend = decodedMsg.slice(msgDelivered, msgDelivered + messageQuantity);

  return await JSON.stringify(msgToSend);
}

export async function getMessagesIpcWorker(event: any, messageQuantity: number) {
  const startTime = performance.now();
  const result = (await runWorker({ messageQuantity, msgDelivered, messages })) as (Cat10 | Cat21)[];
  const endTime = performance.now();
  console.log(`Call to decodeMessages took ${endTime - startTime} milliseconds`);
  console.log(`Finished worker with result: ${result.length}`);
  decodedMsg = result;

  let res = await probIdentification();
  console.log("This is the performance " + res.RWY24L);
  console.log("This is the performance " + res.RWY24R);
  console.log("This is the performance " + res.RWY02);
  console.log("This is the performance " + res.Airbone2);
  console.log("This is the performance " + res.Airbone5);
  console.log("This is the performance " + res.Airbone10);
  console.log("This is the performance " + res.ApronT1);
  console.log("This is the performance " + res.ApronT2);
  console.log("This is the performance " + res.Taxi);
  console.log("This is the performance " + res.StandT1);
  console.log("This is the performance " + res.StandT2);

  await computeAccuracy();
  console.log(accuracy);


  return [];
}

function runWorker(workerData: any) {
  console.log(workerData.messages.length);
  return new Promise((resolve, reject) => {
    const worker = new Worker(__dirname + "/worker.js", { workerData });
    let result: (Cat10 | Cat21)[] = [];
    worker.on("message", (val: any) => {
      result = result.concat(val);
      console.log(result.length);
    });
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        console.log(new Error("Exit worker with code: " + code));
      } else {
        resolve(result);
      }
    });
  });
}

export function getMessagesIpcSlices() {
  const FRAGMENTS = 10000;
  const ret = JSON.stringify(decodedMsg.slice(msgDelivered, msgDelivered + FRAGMENTS));
  msgDelivered += FRAGMENTS;
  if (msgDelivered > decodedMsg.length) msgDelivered = 0;
  return ret;
}

export function probIdentification() {
  let hash: Map<String, HashObject> = new Map();
  let rwy24l = 0, rwy24r = 0, rwy2 = 0, apronT1 = 0, apronT2 = 0, taxi = 0, standT1 = 0, standT2 = 0, airbone2 = 0, airbone5 = 0, airbone10 = 0;
  let rwy24l_f = 0, rwy24r_f = 0, rwy2_f = 0, apronT1_f = 0, apronT2_f = 0, taxi_f = 0, standT1_f = 0, standT2_f = 0, airbone2_f = 0, airbone5_f = 0, airbone10_f = 0;
  const sec = 5;
  decodedMsg.forEach((msg) => {
    if (msg.instrument === "MLAT" && msg.message_type === "Target Report" && msg.target_report_description.TOT === "Aircraft" && msg.target_identification !== undefined && msg.cartesian_coordinates !== undefined) {
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
          switch (zone) {
            case "RWY24L": rwy24l++; break
            case "RWY24R": rwy24r++; break
            case "RWY02": rwy2++; break
            case "ApronT1": apronT1++; break
            case "ApronT2": apronT2++; break
            case "Taxi": taxi++; break
            case "StandT1": standT1++; break
            case "StandT2": standT2++; break
            case "Airbone2.5": airbone2++; break
            case "Airbone5": airbone5++; break
            case "Airbone10": airbone10++; break
          }
          res.time = msg.time_of_day;
          hash.set(ta, res);
        } else {
          if (res?.time + sec > msg.time_of_day) {
            switch (zone) {
              case "RWY24L": rwy24l_f++; break
              case "RWY24R": rwy24r_f++; break
              case "RWY02": rwy2_f++; break
              case "ApronT1": apronT1_f++; break
              case "ApronT2": apronT2_f++; break
              case "Taxi": taxi_f++; break
              case "StandT1": standT1_f++; break
              case "StandT2": standT2_f++; break
              case "Airbone2.5": airbone2_f++; break
              case "Airbone5": airbone5_f++; break
              case "Airbone10": airbone10_f++; break
            }
          } else {
            switch (zone) {
              case "RWY24L": rwy24l++; break
              case "RWY24R": rwy24r++; break
              case "RWY02": rwy2++; break
              case "ApronT1": apronT1++; break
              case "ApronT2": apronT2++; break
              case "Taxi": taxi++; break
              case "StandT1": standT1++; break
              case "StandT2": standT2++; break
              case "Airbone2.5": airbone2++; break
              case "Airbone5": airbone5++; break
              case "Airbone10": airbone10++; break
            }
            hash.set(ta, { target_identification: msg.target_identification.target_identification, time: msg.time_of_day });
          }
        }

      } else {
        hash.set(ta, { target_identification: msg.target_identification.target_identification, time: msg.time_of_day })
        switch (zone) {
          case "RWY24L": rwy24l++; break
          case "RWY24R": rwy24r++; break
          case "RWY02": rwy2++; break
          case "ApronT1": apronT1++; break
          case "ApronT2": apronT2++; break
          case "Taxi": taxi++; break
          case "StandT1": standT1++; break
          case "StandT2": standT2++; break
          case "Airbone2.5": airbone2++; break
          case "Airbone5": airbone5++; break
          case "Airbone10": airbone10++; break
        }
      }

    }
  });
  prob_identification = {
    RWY24L: rwy24l / (rwy24l + rwy24l_f),
    RWY24R: rwy24r / (rwy24r + rwy24r_f),
    RWY02: rwy2 / (rwy2 + rwy2_f),
    Taxi: taxi / (taxi + taxi_f),
    ApronT1: apronT1 / (apronT1 + apronT1_f),
    ApronT2: apronT2 / (apronT2 + apronT2_f),
    StandT1: standT1 / (standT1 + standT1_f),
    StandT2: standT2 / (standT2 + standT2_f),
    Airbone2: airbone2 / (airbone2 + airbone2_f),
    Airbone5: airbone5 / (airbone5 + airbone5_f),
    Airbone10: airbone10 / (airbone10 + airbone10_f),
  };
  return prob_identification;
}

export interface HashObject {
  target_identification: String,
  time: number,
}

export interface ProbIdentification {
  RWY24L: number;
  RWY24R: number;
  RWY02: number;
  Taxi: number;
  ApronT1: number;
  ApronT2: number;
  StandT1: number;
  StandT2: number;
  Airbone2: number;
  Airbone5: number;
  Airbone10: number;
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

}

export interface HashObjectA {
  timeMLAT: number,
  coordsMLAT: WGS_84_coordinates,
  timeADSB: number,
  coordsADSB: WGS_84_coordinates,
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
  let rwy24l: number[] = [], rwy24r: number[] = [], rwy2: number[] = [], apronT1: number[] = [], apronT2: number[] = [], taxi: number[] = [], standT1: number[] = [], standT2: number[] = [], airbone2: number[] = [], airbone5: number[] = [], airbone10: number[] = [];

  decodedMsg.forEach((msg) => {
    if (msg.instrument === "MLAT" && msg.message_type === "Target Report" && msg.target_report_description.TOT === "Aircraft" && msg.cartesian_coordinates !== undefined) {
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
              case "RWY24L": rwy24l.push(mesure); break
              case "RWY24R": rwy24r.push(mesure); break
              case "RWY02": rwy2.push(mesure); break
              case "ApronT1": apronT1.push(mesure); break
              case "ApronT2": apronT2.push(mesure); break
              case "Taxi": taxi.push(mesure); break
              case "StandT1": standT1.push(mesure); break
              case "StandT2": standT2.push(mesure); break
              case "Airbone2.5": airbone2.push(mesure); break
              case "Airbone5": airbone5.push(mesure); break
            }
          }
        }
      }
      hash.set(ta, { timeMLAT: msg.time_of_day, coordsMLAT: target_pos, timeADSB: 0, coordsADSB: { latitude: 0, longitude: 0 } })
    }
    //@ts-ignore
    if (msg.instrument === "ADS-B" && msg.wgs_84_coordinates !== undefined && msg.Pic_accuracy >= min_Pic) {
      const ta = msg.target_address;
      let res = hash.get(ta);

      if (res !== undefined) {
        if (res?.timeMLAT !== 0 && res?.timeADSB !== 0 && (res?.timeADSB - res?.timeMLAT) <= max_windows_sec) {
          //compute
          const mesure = getDistance(res?.coordsMLAT, res?.coordsADSB, 0.01);
          const zone = getAreaLayerPoint(res?.coordsADSB.latitude, res?.coordsADSB.longitude);
          switch (zone) {
            case "RWY24L": rwy24l.push(mesure); break
            case "RWY24R": rwy24r.push(mesure); break
            case "RWY02": rwy2.push(mesure); break
            case "ApronT1": apronT1.push(mesure); break
            case "ApronT2": apronT2.push(mesure); break
            case "Taxi": taxi.push(mesure); break
            case "StandT1": standT1.push(mesure); break
            case "StandT2": standT2.push(mesure); break
            case "Airbone2.5": airbone2.push(mesure); break
            case "Airbone5": airbone5.push(mesure); break
          }
        } else {
          //@ts-ignore
          hash.set(ta, { timeMLAT: res?.timeMLAT, coordsMLAT: res?.coordsMLAT, timeADSB: msg.time_ASTERIX_report_transmission, coordsADSB: msg.wgs_84_coordinates })
        }
      } else {
        //@ts-ignore
        hash.set(ta, { timeMLAT: 0, coordsMLAT: { latitude: 0, longitude: 0 }, timeADSB: msg.time_ASTERIX_report_transmission, coordsADSB: msg.wgs_84_coordinates })
      }
    }
  });

  rwy24l = rwy24l.sort(function (a, b) { return b - a }).slice(Math.round(rwy24l.length * 0.2));
  const rwy24L_95 = rwy24l.slice(Math.round(rwy24l.length * 0.05))[0]
  const rwy24L_99 = rwy24l.slice(Math.round(rwy24l.length * 0.01))[0]
  const rwy24L_average = rwy24l.reduce((partialSum, a) => partialSum + a, 0) / rwy24l.length;
  const rwy24L_std = Math.sqrt(rwy24l.reduce((partialSum, a) => partialSum + Math.pow(a - rwy24L_average, 2), 0) / rwy24l.length);

  rwy24r = rwy24r.sort(function (a, b) { return b - a }).slice(Math.round(rwy24r.length * 0.1));
  const rwy24R_95 = rwy24r.slice(Math.round(rwy24r.length * 0.05))[0]
  const rwy24R_99 = rwy24r.slice(Math.round(rwy24r.length * 0.01))[0]
  const rwy24R_average = rwy24r.reduce((partialSum, a) => partialSum + a, 0) / rwy24r.length;
  const rwy24R_std = Math.sqrt(rwy24r.reduce((partialSum, a) => partialSum + Math.pow(a - rwy24R_average, 2), 0) / rwy24r.length);

  rwy2 = rwy2.sort(function (a, b) { return b - a }).slice(Math.round(rwy2.length * 0.1));
  const rwy2_95 = rwy2.slice(Math.round(rwy2.length * 0.05))[0]
  const rwy2_99 = rwy2.slice(Math.round(rwy2.length * 0.01))[0]
  const rwy2_average = rwy2.reduce((partialSum, a) => partialSum + a, 0) / rwy2.length;
  const rwy2_std = Math.sqrt(rwy2.reduce((partialSum, a) => partialSum + Math.pow(a - rwy2_average, 2), 0) / rwy2.length);

  taxi = taxi.sort(function (a, b) { return b - a }).slice(Math.round(taxi.length * 0.1));
  const taxi_95 = taxi.slice(Math.round(taxi.length * 0.05))[0]
  const taxi_99 = taxi.slice(Math.round(taxi.length * 0.01))[0]
  const taxi_average = taxi.reduce((partialSum, a) => partialSum + a, 0) / taxi.length;
  const taxi_std = Math.sqrt(taxi.reduce((partialSum, a) => partialSum + Math.pow(a - taxi_average, 2), 0) / taxi.length);

  apronT1 = apronT1.sort(function (a, b) { return b - a }).slice(Math.round(apronT1.length * 0.1));
  const apronT1_95 = apronT1.slice(Math.round(apronT1.length * 0.05))[0]
  const apronT1_99 = apronT1.slice(Math.round(apronT1.length * 0.01))[0]
  const apronT1_average = apronT1.reduce((partialSum, a) => partialSum + a, 0) / apronT1.length;
  const apronT1_std = Math.sqrt(apronT1.reduce((partialSum, a) => partialSum + Math.pow(a - apronT1_average, 2), 0) / apronT1.length);

  apronT2 = apronT2.sort(function (a, b) { return b - a }).slice(Math.round(apronT2.length * 0.1));
  const apronT2_95 = apronT2.slice(Math.round(apronT2.length * 0.05))[0]
  const apronT2_99 = apronT2.slice(Math.round(apronT2.length * 0.01))[0]
  const apronT2_average = apronT2.reduce((partialSum, a) => partialSum + a, 0) / apronT2.length;
  const apronT2_std = Math.sqrt(apronT2.reduce((partialSum, a) => partialSum + Math.pow(a - apronT2_average, 2), 0) / apronT2.length);

  const airbone2_95 = airbone2.sort(function (a, b) { return b - a }).slice(Math.round(airbone2.length * 0.05))[0]
  const airbone2_average = airbone2.reduce((partialSum, a) => partialSum + a, 0) / airbone2.length;
  const airbone2_std = Math.sqrt(airbone2.reduce((partialSum, a) => partialSum + Math.pow(a - airbone2_average, 2), 0) / airbone2.length);

  const airbone5_95 = airbone5.sort(function (a, b) { return b - a }).slice(Math.round(airbone5.length * 0.05))[0]
  const airbone5_average = airbone5.reduce((partialSum, a) => partialSum + a, 0) / airbone5.length;
  const airbone5_std = Math.sqrt(airbone5.reduce((partialSum, a) => partialSum + Math.pow(a - airbone5_average, 2), 0) / airbone5.length);

  const standT1_max = standT1.sort(function (a, b) { return b - a }).slice(Math.round(standT1.length * 0.05))[0]
  const standT1_average = standT1.reduce((partialSum, a) => partialSum + a, 0) / standT1.length;
  const standT1_std = Math.sqrt(standT1.reduce((partialSum, a) => partialSum + Math.pow(a - standT1_average, 2), 0) / standT1.length);

  const standT2_max = standT2.sort(function (a, b) { return b - a }).slice(Math.round(standT2.length * 0.05))[0]
  const standT2_average = standT2.reduce((partialSum, a) => partialSum + a, 0) / standT2.length;
  const standT2_std = Math.sqrt(standT2.reduce((partialSum, a) => partialSum + Math.pow(a - standT2_average, 2), 0) / standT2.length);


  accuracy = {
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

    apronT1_95max: taxi_95,
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
  }
  return accuracy;
}

export function tableProtocol(event: any, { page, filter, search }: { page: number; filter: any; search: string }) {
  const MSG_PER_PAGE = 15;

  return JSON.stringify({
    messages: decodedMsg.slice(page * MSG_PER_PAGE - MSG_PER_PAGE, page * MSG_PER_PAGE),
    totalMessages: decodedMsg.length,
  });
}
