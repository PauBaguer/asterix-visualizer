type electron = {
  send: (channel: string, data?: any) => void;
  sendSync: (channel: string, data?: any) => void;
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
  props: {
    name: "world",
  },
});

export default app;
