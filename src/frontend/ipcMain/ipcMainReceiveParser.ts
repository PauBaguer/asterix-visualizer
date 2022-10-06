import { ipcMainBidirectional } from "./ipcMainCallers";

export function parseIpcMainReceiveMessage(msg: string) {
  console.log(msg);
  if (msg == "52659") ipcMainBidirectional("get-message-quantity", 5);
}
