import { Cat10 } from "../asterix/cat10_decoder";
import { classifyMessages, decodeClass10Messages, sliceMainBuffer } from "../asterix/message_cassifier";
import { openFilePicker } from "./file_management";

let buffer: Buffer | undefined;
let messages: Buffer[];
let cat10msg: Buffer[];
let cat21msg: Buffer[];

export async function loadFileIpc() {
  buffer = await openFilePicker();
  if (!buffer) {
    console.log("No file opened");
    return;
  }

  messages = await sliceMainBuffer(buffer);
  [cat10msg, cat21msg] = await classifyMessages(messages);
  return messages.length;
}

//@ts-ignore
export async function getMessagesIpc(event: any, messageQuantity: number) {
  console.log(messageQuantity);
  console.log(cat10msg.slice(0, messageQuantity));
  const decodedCat10msg: Cat10[] = await decodeClass10Messages(buffer!, cat10msg.slice(0, messageQuantity))!;
  console.log("decoded:");
  console.log(decodedCat10msg);

  return decodedCat10msg;
}
