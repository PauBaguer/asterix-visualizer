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
    const res = await ipcMainBidirectional("get-message-quantity", -1); //TODO change to -1
    messages = await parseIpcMainReceiveMessage(res);
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
        <button on:click="{() => csv_file()}">csv file</button>
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
