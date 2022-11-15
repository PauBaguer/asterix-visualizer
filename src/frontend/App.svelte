<style>
  main {
    margin: 0 auto;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
    width: 100%;
    height: 100%;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }

  .ontop {
    z-index: 100;
    top: 50px;
  }
  .main {
    padding: 0;
    margin: 0;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
    width: 100%;
    height: 100%;
  }

  .overflow {
    overflow-y: hidden;
    overflow-x: hidden;
  }

  #viewDiv {
    width: 100%;
    height: 100%;
  }
</style>

<script lang="ts">
  import { initializeMap } from "./arcgis/map";
  import type { Cat10 } from "./custom-types/asterix/cat10";
  import type { Cat21 } from "./custom-types/asterix/cat21";
  import { FileModel } from "./custom-types/asterix/models";
  import { initIpcMainBidirectional, ipcMainBidirectional, ipcMainOneDirection } from "./ipcMain/ipcMainCallers";
  import { parseIpcMainReceiveMessage } from "./ipcMain/ipcMainReceiveParser";
  import ExpandableTable from "./svelte-components/table/ExpandableTable.svelte";

  let messages: (Cat10 | Cat21)[] = [];

  initializeMap();

  window.electron.pushNotification((event: any, value: string) => {
    console.log(event);
    console.log(value);
  });

  async function handleLoadFileClick() {
    const numberOfMsg = await initIpcMainBidirectional("test-receive");
    console.log(`Loaded ${numberOfMsg} messages!`);
    const res = await ipcMainBidirectional("get-message-quantity", -1);
    messages = await parseIpcMainReceiveMessage(res);
  }

  async function handleDecodeMessages() {
    const res = await ipcMainBidirectional("get-message-quantity", 20000);
    console.log(res);

    const data = await FileModel.findOne({ hash: res });
    console.log(data?.messages.length);
    //@ts-ignore
    messages = await parseIpcMainReceiveMessage(data?.messages.values());
  }

  async function handleMapClick() {
    visibleItem = "MAP";
    initializeMap();
  }

  async function handleMessageDecoderClick() {
    visibleItem = "MESSAGE_DECODER";
  }

  async function handleSettingsClick() {
    visibleItem = "SETTINGS";
  }

  let visibleItem = "MAP";
</script>

<main>
  <div class="{visibleItem === 'MAP' ? 'main overflow' : 'main'}">
    <ul class="nav nav-tabs">
      <li role="presentation" class="{visibleItem === 'MAP' ? 'active' : ''}" on:click="{handleMapClick}">
        <a href="#a">MAP</a>
      </li>
      <li
        role="presentation"
        class="{visibleItem === 'MESSAGE_DECODER' ? 'active' : ''}"
        on:click="{handleMessageDecoderClick}"
      >
        <a href="#a">Message decoder</a>
      </li>
      <li role="presentation" class="{visibleItem === 'SETTINGS' ? 'active' : ''}" on:click="{handleSettingsClick}">
        <a href="#a">Settings</a>
      </li>
    </ul>
    {#if visibleItem === "MAP"}
      <div class="ontop">
        <button on:click="{async () => await initIpcMainBidirectional('test-handle')}">IPC MAIN test</button>
        <button on:click="{() => ipcMainOneDirection('open-file-picker')}">Open file picker</button>
        <button on:click="{() => ipcMainOneDirection('open-test-file')}">Open test file</button>
        <button on:click="{handleLoadFileClick}">Test IPC value return</button>
        <button on:click="{handleDecodeMessages}">Test decode msg</button>
      </div>
      <div id="viewDiv"></div>
    {/if}

    {#if visibleItem === "MESSAGE_DECODER"}
      <ExpandableTable messages="{messages}" />
    {/if}
  </div>
</main>
