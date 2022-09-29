import { parseIpcMainReceiveMessage } from "./ipcMainReceiveParser";

export async function ipcMainBidirectional(event: string) {
  const returnValue = await window.electron.sendAndReceive(event);
  parseIpcMainReceiveMessage(returnValue);
}

export function ipcMainOneDirection(event: string) {
  window.electron.send(event);
}
