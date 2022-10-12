import { Cat10 } from "../asterix/cat10_decoder";
import { Cat21 } from "../asterix/cat21_decoder";
import {
  classifyMessages as decodeMessages,
  decodeClass10Messages,
  decodeClass21Messages,
  sliceMainBuffer,
} from "../asterix/message_cassifier";
import { openFilePicker } from "./file_management";

let buffer: Buffer | undefined;
let messages: Buffer[];
let cat10msg: Buffer[];
let cat21msg: Buffer[];
let decodedMsg: (Cat10 | Cat21)[];

export async function loadFileIpc() {
  buffer = await openFilePicker();
  if (!buffer) {
    console.log("No file opened");
    return;
  }

  messages = await sliceMainBuffer(buffer);
  return messages.length;
}

//@ts-ignore
export async function getMessagesIpc(event: any, messageQuantity: number) {
  decodedMsg = await decodeMessages(messages, messageQuantity);
  console.log(decodedMsg.length);
  return JSON.stringify(decodedMsg);
}
