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
  async function csv_file() {
    console.log("Creating csv file");

    let csvContent =
      "Id,Class,Message type,Data source identifier,Target report description,WGS84 coordinates,Polar coordinates,Cartesian coordinates,Calculated track velocity polar coordinates,Calculated track velocity cartesian coordinates,Mod 3A code,Flight level,Measured height,Altitude of primary plot,Time of day,Track number,Track status,Calculated acceleration,Target address,Target identification,Mode S MB data,Target size and orientation,Presence,Vehicle fleet identification,Preprogrammed message,Standard deviation of position,System status,Aircraft operational status,Service identification,Service management,Emitter category,Target report descriptor,Time applicability position,Time applicability velocity,Time message reception position,Time message reception position high,Time message reception velocity,Time message reception velocity high,TimeASTERIX report transmission,Quality indicator,Tarjectory intent,WGS84 coordinates high,Message amplitude,Geometric height,Selected altitude,Final state selected altitude,Air speed,True airspeed,Magnetic heading,Barometric vertical rate,Geometric vertical rate,Airborne ground vector,Track angle rate,Target status,MOPS version,Met information,Roll angle,ACAS resolution advisory report,Surface capabilities and characteristics,Receiver ID \n";

    messages.forEach((value) => {
      csvContent += '"' + value.csv.join('","') + '" \n';
    });
    const blob = new Blob(["\ufeff", csvContent], { type: "text/csv;" });
    var reader = new FileReader();
    reader.onload = function (event: any) {
      var save = document.createElement("a");
      save.href = event.target.result;
      save.target = "_blank";
      var d = new Date();
      save.download =
        "AsterixDecode_" +
        d.getFullYear() +
        "-" +
        (d.getMonth() + 1) +
        "-" +
        d.getDate() +
        "T" +
        d.getHours() +
        "-" +
        d.getMinutes() +
        ".csv";
      try {
        var clicEvent = new MouseEvent("click", {
          view: window,
          bubbles: true,
          cancelable: true,
        });
      } catch (e) {
        var clicEvent = document.createEvent("MouseEvent");
        clicEvent.initEvent("click", true, true);
      }
      save.dispatchEvent(clicEvent);
      (window.URL || window.webkitURL).revokeObjectURL(save.href);
    };
    reader.readAsDataURL(blob);
  }
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

        <button type="button" class="btn btn-primary me-3" on:click="{csv_file}"
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
