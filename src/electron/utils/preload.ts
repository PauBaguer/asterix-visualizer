import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  send: (channel: string, data: any) => {
    ipcRenderer.send(channel, data);
  },
  sendSync: (channel: string, data: any) => {
    ipcRenderer.sendSync(channel, data);
  },
  sendAndReceive: async (channel: string, data: any) => ipcRenderer.invoke(channel, data),
  //   receive: (channel: any, func: any) => {
  //     ipcRenderer.on(channel, (event, ...args) => func(...args));
  //   },
});
