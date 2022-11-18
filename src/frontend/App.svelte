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
    position: absolute;
    z-index: 100;
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
    position: relative;
    width: 100%;
    height: calc(100vh - 42px);
  }
  #btn-bar {
    bottom: 20px;
    background-color: #222222;

    padding: 10px;
    border-radius: 10px;
    left: 50%;
    transform: translate(-50%, 0);
    width: max-content;
  }

  :global(.esri-view .esri-view-surface--inset-outline:focus::after) {
    outline: none !important;
  }
</style>

<script lang="ts">
  import { initializeMap } from "./arcgis/map";
  import { initializeSimulation, tickSimulation } from "./arcgis/simulation";
  import type { Cat10 } from "./custom-types/asterix/cat10";
  import type { Cat21 } from "./custom-types/asterix/cat21";
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
    const res = await ipcMainBidirectional("get-message-quantity", 500);
    messages = await parseIpcMainReceiveMessage(res);
    initializeSimulation(messages);
  }

  async function handleDecodeMessages() {
    const res = await ipcMainBidirectional("get-message-quantity", 20000);
    messages = await parseIpcMainReceiveMessage(res);
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
      <li class="nav-item" on:click="{handleMapClick}">
        <a class="{visibleItem === 'MAP' ? 'nav-link active' : 'nav-link'}" href="#a">MAP</a>
      </li>
      <li class="nav-item" on:click="{handleMessageDecoderClick}">
        <a class="{visibleItem === 'MESSAGE_DECODER' ? 'nav-link active' : 'nav-link'}" href="#a">Table view</a>
      </li>
    </ul>
    {#if visibleItem === "MAP"}
      <div class="ontop dark" id="btn-bar">
        <button type="button" class="btn btn-primary" on:click="{handleLoadFileClick}"
          ><i class="bi bi-folder2-open"></i></button
        >

        <button type="button" class="btn btn-primary me-3" on:click="{handleLoadFileClick}"
          ><i class="bi bi-filetype-csv"></i>
        </button>
        <button type="button" class="btn btn-primary" on:click="{handleLoadFileClick}"
          ><i class="bi bi-arrow-90deg-left"></i></button
        >
        <button type="button" class="btn btn-primary" on:click="{handleLoadFileClick}"
          ><i class="bi bi-arrow-counterclockwise"></i>
        </button>

        <button type="button" class="btn btn-primary" on:click="{handleLoadFileClick}"
          ><i class="bi bi-play"></i>
        </button>

        <button type="button" class="btn btn-primary" on:click="{tickSimulation}"
          ><i class="bi bi-arrow-90deg-right"></i>
        </button>
      </div>
      <div id="viewDiv"></div>
    {/if}

    {#if visibleItem === "MESSAGE_DECODER"}
      <ExpandableTable messages="{messages}" />
    {/if}
  </div>
</main>
