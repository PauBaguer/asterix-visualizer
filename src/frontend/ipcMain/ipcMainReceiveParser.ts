import { ipcMainBidirectional } from "./ipcMainCallers";

export async function parseInitIpcMain(msg: string) {
  console.log(`Loaded ${msg} messages!`);
}

export async function parseIpcMainReceiveMessage(msg: string) {
  console.log(msg);

  const messages = await JSON.parse(msg);
  console.log(messages);
}
