import { parseInitIpcMain, parseIpcMainReceiveMessage } from "./ipcMainReceiveParser";

export async function initIpcMainBidirectional(event: string) {
  const returnValue = await window.electron.sendAndReceive(event);
  parseInitIpcMain(returnValue);
}

export async function ipcMainBidirectional(event: string, data?: any) {
  const returnValue = await window.electron.sendAndReceive(event, data);
  parseIpcMainReceiveMessage(returnValue);
}

export function ipcMainOneDirection(event: string) {
  window.electron.send(event);
}
