import {
  app,
  BrowserWindow,
  Notification,
  ipcMain,
  // nativeImage
} from "electron";
import { join } from "path";
import { parse } from "url";
import { autoUpdater } from "electron-updater";

import logger from "./utils/logger";
import settings from "./utils/settings";
import { openFilePicker, openTestFile } from "./utils/file_management";
import { sliceMainBuffer, classifyMessages } from "./asterix/message_cassifier";
import { getMessagesIpc, loadFileIpc } from "./utils/ipcMain";
import { Cat21, fromTwosComplement } from "./asterix/cat21_decoder";
import mongoose from "mongoose";
import { FileModel } from './asterix/models';
import { Cat10 } from "./asterix/cat10_decoder";
const crypto = require('crypto');

const isProd = process.env.NODE_ENV === "production" || app.isPackaged;

logger.info("App starting...");
settings.set("check", true);
logger.info("Checking if settings store works correctly.");
logger.info(settings.get("check") ? "Settings store works correctly." : "Settings store has a problem.");

let mainWindow: BrowserWindow | null;
let notification: Notification | null;

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    icon: "assets/asterix_color.png",
    webPreferences: {
      devTools: isProd ? false : true,
      contextIsolation: true,
      preload: join(__dirname, "/utils/preload.js"),
    },
  });

  const url =
    // process.env.NODE_ENV === "production"
    isProd
      ? // in production, use the statically build version of our application
      `file://${join(__dirname, "public", "index.html")}`
      : // in dev, target the host and port of the local rollup web server
      "http://localhost:5000";

  mainWindow.loadURL(url).catch((err) => {
    logger.error(JSON.stringify(err));
    app.quit();
  });

  await mongoose.connect("mongodb+srv://Admin:Admin@asterix.yjrwoyw.mongodb.net/?retryWrites=true&w=majority")
    .then(() => {
      console.log("Connexion establecida ^^ !");
    })
    .catch((_error) => {
      console.log("Error de connexion con la base de datos :( ");
    })

  if (!isProd) mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  ipcMain.on("test", () => {
    console.log("IPC_MAIN TEST SUCCESS");
  });

  ipcMain.on("open-file-picker", async () => {
    const buffer = await openFilePicker();
    if (!buffer) return;

    //Hash of the file
    const hashSum = crypto.createHash('sha256');
    hashSum.update(buffer);
    const hash: string = hashSum.digest('hex');

    var messages = await sliceMainBuffer(buffer!);
    messages = messages.filter((v) => v[0] === 10 || v[0] === 21);

    let filedata = await FileModel.findOne({ hash: hash });
    if (!filedata) {
      classifyMessages(messages, hash, -1);
    }
    else if (filedata.messages.length < messages.length) {
      classifyMessages(messages, hash, filedata.messages.length);
    }

    mainWindow?.webContents.send("push-notification", await JSON.stringify(hash));
  });

  ipcMain.on("open-test-file", async () => {
    const buffer = await openTestFile();

    //Hash of the file
    const hashSum = crypto.createHash('sha256');
    hashSum.update(buffer);
    const hash: string = hashSum.digest('hex');

    var messages = await sliceMainBuffer(buffer!);
    messages = messages.filter((v) => v[0] === 10 || v[0] === 21);

    let filedata = await FileModel.findOne({ hash: hash });
    if (!filedata) {
      classifyMessages(messages, hash, -1);
    }
    else if (filedata.messages.length < messages.length) {
      classifyMessages(messages, hash, filedata.messages.length);
    }

    mainWindow?.webContents.send("push-notification", await JSON.stringify(hash));
  });

  ipcMain.handle("test-handle", async () => {
    console.log("HIII");
    console.log(fromTwosComplement("1010"));

    console.log(fromTwosComplement("0101"));
  });

  ipcMain.handle("test-receive", loadFileIpc);
  ipcMain.handle("get-message-quantity", getMessagesIpc);
};
function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.on("ready", createWindow);

// those two events are completely optional to subscrbe to, but that's a common way to get the
// user experience people expect to have on macOS: do not quit the application directly
// after the user close the last window, instead wait for Command + Q (or equivalent).
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});

app.on("web-contents-created", (e, contents) => {
  logger.info(e);
  // Security of webviews
  contents.on("will-attach-webview", (event, webPreferences, params) => {
    logger.info(event, params);
    // Strip away preload scripts if unused or verify their location is legitimate
    delete webPreferences.preload;

    // Disable Node.js integration
    webPreferences.nodeIntegration = false;

    // Verify URL being loaded
    // if (!params.src.startsWith(`file://${join(__dirname)}`)) {
    //   event.preventDefault(); // We do not open anything now
    // }
  });

  contents.on("will-navigate", (event, navigationUrl) => {
    const parsedURL = parse(navigationUrl);
    // In dev mode allow Hot Module Replacement
    if (parsedURL.host !== "localhost:5000" && !isProd) {
      logger.warn("Stopped attempt to open: " + navigationUrl);
      event.preventDefault();
    } else if (isProd) {
      logger.warn("Stopped attempt to open: " + navigationUrl);
      event.preventDefault();
    }
  });
});

if (isProd)
  autoUpdater.checkForUpdates().catch((err) => {
    logger.error(JSON.stringify(err));
  });

autoUpdater.logger = logger;

autoUpdater.on("update-available", () => {
  notification = new Notification({
    title: "Electron-Svelte-Typescript",
    body: "Updates are available. Click to download.",
    silent: true,
    // icon: nativeImage.createFromPath(join(__dirname, "..", "assets", "icon.png"),
  });
  notification.show();
  notification.on("click", () => {
    autoUpdater.downloadUpdate().catch((err) => {
      logger.error(JSON.stringify(err));
    });
  });
});

autoUpdater.on("update-not-available", () => {
  notification = new Notification({
    title: "Electron-Svelte-Typescript",
    body: "Your software is up to date.",
    silent: true,
    // icon: nativeImage.createFromPath(join(__dirname, "..", "assets", "icon.png"),
  });
  notification.show();
});

autoUpdater.on("update-downloaded", () => {
  notification = new Notification({
    title: "Electron-Svelte-Typescript",
    body: "The updates are ready. Click to quit and install.",
    silent: true,
    // icon: nativeImage.createFromPath(join(__dirname, "..", "assets", "icon.png"),
  });
  notification.show();
  notification.on("click", () => {
    autoUpdater.quitAndInstall();
  });
});

autoUpdater.on("error", (err) => {
  notification = new Notification({
    title: "Electron-Svelte-Typescript",
    body: JSON.stringify(err),
    // icon: nativeImage.createFromPath(join(__dirname, "..", "assets", "icon.png"),
  });
  notification.show();
});
