import { parseIpcMainReceiveMessage } from "./ipcMainReceiveParser";

export async function ipcMainBidirectional(event: string, data?: any) {
  const returnValue = await window.electron.sendAndReceive(event, data);
  parseIpcMainReceiveMessage(returnValue);
}

export function ipcMainOneDirection(event: string) {
  window.electron.send(event);
}
