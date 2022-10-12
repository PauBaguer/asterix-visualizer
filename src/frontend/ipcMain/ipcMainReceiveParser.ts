import { ipcMainBidirectional } from "./ipcMainCallers";

export async function parseInitIpcMain(msg: string) {
  console.log(`Loaded ${msg} messages!`);
  ipcMainBidirectional("get-message-quantity", 20000);
}

export async function parseIpcMainReceiveMessage(msg: string) {
  console.log(msg);

  const messages = JSON.parse(msg);
  console.log(messages);
}
