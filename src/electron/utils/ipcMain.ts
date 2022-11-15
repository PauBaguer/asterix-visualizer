import { Cat10 } from "../asterix/cat10_decoder";
import { Cat21 } from "../asterix/cat21_decoder";
import { classifyMessages as decodeMessages, sliceMainBuffer } from "../asterix/message_cassifier";
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
export async function getMessagesIpc(event: any, messageQuantity: number, hash: string) {// TODO aixo s'utilitzar per algo??
  await decodeMessages(messages, hash, -1);
  console.log(decodedMsg.length);
  return await JSON.stringify(hash);
}
