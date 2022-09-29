type electron = {
  send: (channel: string, data?: any) => void;
  sendSync: (channel: string, data?: any) => void;
  sendAndReceive: (channel: string, data?: any) => string;
};
declare global {
  interface Window {
    electron: electron;
  }
}

import "svelte";
import App from "./App.svelte";

const app = new App({
  target: document.body,
});

export default app;
