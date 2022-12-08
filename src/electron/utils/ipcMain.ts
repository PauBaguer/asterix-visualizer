import { Cat10 } from "../asterix/cat10_decoder";
import { Cat21 } from "../asterix/cat21_decoder";
import { classifyMessages as decodeMessages, sliceMainBuffer } from "../asterix/message_cassifier";
import { openFilePicker, saveFileCsv, saveFileKml } from "./file_management";
import { Worker } from "node:worker_threads";
import { Notification } from "electron";
const JsonSearch = require("search-array").default;

let buffer: Buffer | undefined;
let messages: Buffer[];
let decodedMsg: (Cat10 | Cat21)[];
let msgDelivered = 0;
let performanceData: any;

export async function loadFileIpc() {
  //const startTime = performance.now();
  const res = await openFilePicker();
  if (!res) return;

  buffer = res;
  // const endTime = performance.now();

  // console.log(`Call to openFilePicker took ${endTime - startTime} milliseconds`);
  messages = [];
  decodedMsg = [];
  msgDelivered = 0;

  if (!buffer) {
    console.log("No file opened");
    return;
  }

  messages = await sliceMainBuffer(buffer);
  let L = messages.length > 5000000 ? 300000 : messages.length;
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
  // const slice1 = messages.slice(0, 250000);
  // const slice2 = messages.slice(250000, messages.length);
  const result = (await runWorker({ messages })) as (Cat10 | Cat21)[];
  //const result2 = (await runWorker({ messages: slice2 })) as (Cat10 | Cat21)[];
  const endTime = performance.now();
  console.log(`Call to decodeMessages took ${endTime - startTime} milliseconds`);
  decodedMsg = result; //.concat(result2);

  return [];
}

export async function startCalculationOfPerformanceData() {
  //const slice = decodedMsg.filter((v) => v.instrument !== "SMR");

  console.log(`Starting performance calculations with ${decodedMsg.length} messages.`);
  const startTimeP = performance.now();

  performanceData = await runWorker2({ messagesLength: decodedMsg.length });
  const endTimeP = performance.now();
  console.log(`Call to performanceData took ${endTimeP - startTimeP} milliseconds`);
}

export async function writeCsvFile() {
  const picker = await saveFileCsv();
  if (!picker.filePath) return;
  await runWorkercsv({ messagesLength: decodedMsg.length, filePath: picker.filePath });
  console.log(`${picker.filePath} written`);
  new Notification({ title: "ASTERIX Message Decoder", body: "CSV file successfully written" }).show();
}

export async function writeKmlFile() {
  const picker = await saveFileKml();
  if (!picker.filePath) return;
  await runWorkerkml({ messagesLength: decodedMsg.length, filePath: picker.filePath });
  new Notification({ title: "ASTERIX Message Decoder", body: "KML file successfully written" }).show();
  console.log(`${picker.filePath} written`);
}

function runWorker(workerData: any) {
  console.log(workerData.messages.length);
  return new Promise((resolve, reject) => {
    const worker = new Worker(__dirname + "/worker.js", { workerData });
    let result: (Cat10 | Cat21)[] = [];
    worker.on("message", (val: any) => {
      result = result.concat(val);
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

function runWorker2(workerData: any) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__dirname + "/worker2.js", { workerData });
    let result: any;
    worker.on("message", (val: any) => {
      result = val;
    });
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        console.log(new Error("Exit worker with code: " + code));
      } else {
        resolve(result);
      }
    });
    if (decodedMsg.length > 300000) {
      worker.postMessage(decodedMsg.slice(0, 300000));
      worker.postMessage(decodedMsg.slice(300000, decodedMsg.length));
    } else {
      worker.postMessage(decodedMsg);
    }
  });
}

function runWorkercsv(workerData: any) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__dirname + "/csv_worker.js", { workerData });
    let result: any;
    worker.on("message", (val: any) => {
      result = val;
    });
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        console.log(new Error("Exit worker with code: " + code));
      } else {
        resolve(result);
      }
    });
    if (decodedMsg.length > 300000) {
      worker.postMessage(decodedMsg.slice(0, 300000));
      worker.postMessage(decodedMsg.slice(300000, decodedMsg.length));
    } else {
      worker.postMessage(decodedMsg);
    }
  });
}

function runWorkerkml(workerData: any) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__dirname + "/kml_worker.js", { workerData });
    let result: any;
    worker.on("message", (val: any) => {
      result = val;
    });
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        console.log(new Error("Exit worker with code: " + code));
      } else {
        resolve(result);
      }
    });
    if (decodedMsg.length > 300000) {
      worker.postMessage(decodedMsg.slice(0, 300000));
      worker.postMessage(decodedMsg.slice(300000, decodedMsg.length));
    } else {
      worker.postMessage(decodedMsg);
    }
  });
}

export function getMessagesIpcSlices() {
  const FRAGMENTS = 10000;
  const ret = JSON.stringify(decodedMsg.slice(msgDelivered, msgDelivered + FRAGMENTS));
  msgDelivered += FRAGMENTS;
  if (msgDelivered > decodedMsg.length) msgDelivered = 0;
  return ret;
}

export function parametersResults() {
  return JSON.stringify(performanceData);
}

let oldFilter: Filter = {
  Category: [],
  Instrument: [],
  Area: [],
  MessageType: [],
};

let oldSearch: string = "";

let msgFiltered: (Cat10 | Cat21)[];
const MSG_PER_PAGE = 15;

export function tableProtocol(event: any, { page, filter, search }: { page: number; filter: Filter; search: string }) {
  // filter = { Category: ["Cat10"], Instrument: ["MLAT"], Area: ["RWY"] }
  // console.log({ filter });
  // console.log({ search });

  if (!msgFiltered) msgFiltered = decodedMsg;

  if (JSON.stringify(oldFilter) === JSON.stringify(filter) && oldSearch === search) {
    return JSON.stringify({
      messages: msgFiltered.slice(page * MSG_PER_PAGE - MSG_PER_PAGE, page * MSG_PER_PAGE),
      totalMessages: msgFiltered.length,
    });
  }

  //filter current filter
  msgFiltered = decodedMsg;
  oldFilter = filter;
  if (filter.Category.length > 0) msgFiltered = msgFiltered.filter((m) => filter.Category.includes(m.class));
  if (filter.Instrument.length > 0) msgFiltered = msgFiltered.filter((m) => filter.Instrument.includes(m.instrument));
  if (filter.MessageType.length > 0)
    msgFiltered = msgFiltered.filter((m) => m.class === "Cat10" && filter.MessageType.includes(m.message_type));

  if (filter.TrackNumber) msgFiltered = msgFiltered.filter((m) => m.track_number === filter.TrackNumber);
  if (filter.TargetIdentification)
    msgFiltered = msgFiltered.filter(
      (m) => m.target_identification && JSON.stringify(m.target_identification).includes(filter.TargetIdentification!)
    );
  if (filter.TargetAddress)
    msgFiltered = msgFiltered.filter((m) => m.target_address && m.target_address === filter.TargetAddress);

  oldSearch = search;

  if (search !== "") {
    const searcher = new JsonSearch(msgFiltered);

    msgFiltered = searcher.query(search) as (Cat10 | Cat21)[];
  }

  // const computeArea = filter.Area.length === 0 || filter.Area.length === 5;

  // const msgfilter = decodedMsg.filter((msg) => {
  //   if (filter.Category.includes(msg.class) && filter.Instrument.includes(msg.instrument)) {
  //     if (!computeArea) {
  //       switch (msg.class) {
  //         case "Cat10": {
  //           if (msg.cartesian_coordinates !== undefined) {
  //             const target_pos = computeDestinationPoint(
  //               { latitude: 41.29706278, longitude: 2.078447222 },
  //               Math.sqrt(Math.pow(msg.cartesian_coordinates.x, 2) + Math.pow(msg.cartesian_coordinates.y, 2)),
  //               (Math.atan2(msg.cartesian_coordinates.x, msg.cartesian_coordinates.y) * 180) / Math.PI
  //             );
  //             return isPointInArea(target_pos.latitude, target_pos.longitude, filter.Area);
  //           }
  //           break;
  //         }
  //         case "Cat21": {
  //           if (msg.wgs_84_coordinates !== undefined) {
  //             return isPointInArea(msg.wgs_84_coordinates.latitude, msg.wgs_84_coordinates.longitude, filter.Area);
  //           }
  //           break;
  //         }
  //       }
  //     }
  //     return true;
  //   }
  //   return false;
  // });

  return JSON.stringify({
    messages: msgFiltered.slice(page * MSG_PER_PAGE - MSG_PER_PAGE, page * MSG_PER_PAGE),
    totalMessages: msgFiltered.length,
  });
}

interface Filter {
  Category: string[];
  Instrument: string[];
  Area: string[];
  MessageType: string[];
  TargetAddress?: string;
  TargetIdentification?: string;
  TrackNumber?: number;
}
