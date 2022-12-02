import { Cat10 } from "../asterix/cat10_decoder";
import { Cat21 } from "../asterix/cat21_decoder";
import { classifyMessages as decodeMessages, sliceMainBuffer } from "../asterix/message_cassifier";
import { openFilePicker } from "./file_management";
import { Worker } from "node:worker_threads";

let buffer: Buffer | undefined;
let messages: Buffer[];
let decodedMsg: (Cat10 | Cat21)[];
let msgDelivered = 0;

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

export function tableProtocol(event: any, { page, filter, search }: { page: number; filter: any; search: string }) {
  const MSG_PER_PAGE = 15;

  return JSON.stringify({
    messages: decodedMsg.slice(page * MSG_PER_PAGE - MSG_PER_PAGE, page * MSG_PER_PAGE),
    totalMessages: decodedMsg.length,
  });
}
