import { parseInitIpcMain, parseIpcMainReceiveMessage } from "./ipcMainReceiveParser";

export async function initIpcMainBidirectional(event: string) {
  return await window.electron.sendAndReceive(event);
}

export async function ipcMainBidirectional(event: string, data?: any) {
  return await window.electron.sendAndReceive(event, data);
}

export function ipcMainOneDirection(event: string) {
  window.electron.send(event);
}
