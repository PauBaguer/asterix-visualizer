import { workerData, parentPort } from "node:worker_threads";
import { classifyMessages as decodeMessages } from "../asterix/message_cassifier";

doStuff();

async function doStuff() {
  const FRAGMENTS = 1000;
  let i = 0;
  let L = workerData.messages.length > 500000 ? 300000 : workerData.messages.length;

  while (i < L) {
    const decodedMsg = await decodeMessages(workerData.messages.slice(i, i + FRAGMENTS), -1, i);
    parentPort?.postMessage(decodedMsg);
    i += FRAGMENTS;
  }
}
