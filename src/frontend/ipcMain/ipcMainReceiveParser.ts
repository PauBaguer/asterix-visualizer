import { ipcMainBidirectional } from "./ipcMainCallers";

export function parseInitIpcMain(msg: string) {
  console.log(`Loaded ${msg} messages!`);
  ipcMainBidirectional("get-message-quantity", 50);
}

export function parseIpcMainReceiveMessage(msg: string) {
  console.log(msg);

  const messages = JSON.parse(msg);
  console.log(messages);
}
