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

  #settings {
    display: flex;
    flex-direction: column;
    gap: 5px;
    justify-content: center;
    bottom: 20px;
    background-color: #222222;

    padding: 10px;
    border-radius: 10px;
    left: 10px;

    width: max-content;
  }

  #legend {
    bottom: 20px;
    background-color: #222222;

    padding: 10px;
    border-radius: 10px;
    right: 10px;

    width: max-content;
  }

  #planes {
    left: 10px;

    background-color: #222222;
    border-radius: 10px;
  }
  .bottom-planes {
    bottom: 20px;
    max-height: 650px;
  }

  .top-planes {
    bottom: 215px;
    max-height: 450px;
  }
  td {
    vertical-align: middle;
  }

  :global(.esri-view .esri-view-surface--inset-outline:focus::after) {
    outline: none !important;
  }

  #progDiv {
    margin-bottom: 3px;
  }

  .color {
    border-radius: 50%;
    margin-left: 5px;
    margin-right: 10px;
    height: 10px;
    width: 10px;
    border-color: black;
    border-style: solid;
    border-width: 1px;
  }
  .color-round {
    border-radius: 50%;
    margin-right: 10px;
    height: 20px;
    width: 20px;
    border-color: black;
    border-style: solid;
    border-width: 1px;
  }

  .color-area {
    margin-left: 5px;
    margin-right: 10px;
    height: 15px;
    width: 15px;
    border-color: white;
    border-style: solid;
    border-width: 1px;
  }

  #overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0px;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>

<script lang="ts" type="module">
  import { initializeMap } from "./arcgis/map";

  import { fade } from "svelte/transition";
  import type { Cat10 } from "./custom-types/asterix/cat10";
  import type { Cat21 } from "./custom-types/asterix/cat21";
  import { initIpcMainBidirectional, ipcMainBidirectional } from "./ipcMain/ipcMainCallers";
  import { parseIpcMainReceiveMessage } from "./ipcMain/ipcMainReceiveParser";
  import ExpandableTable from "./svelte-components/table/ExpandableTable.svelte";
  import ParametersTable from "./svelte-components/parameters/parameters.svelte";
  import Simulation from "./svelte-components/simulation/simulation.svelte";
  import PlanesComponent from "./svelte-components/planesComponent.svelte";
  import { setSMRVisibility, setADSBVisibility, setMLATVisibility } from "./arcgis/groundLayer";
  import { setAreasLayerVisibility } from "./arcgis/areasLayer";
  import { setPlanesLayerVisibility, setPathsLayerVisibility } from "./arcgis/graphicsLayer";

  let messages: (Cat10 | Cat21)[] = [];

  let numberOfMsg = 0;
  let simulationComponent: Simulation;

  let play = false;
  let loading = false;

  let settings = false;
  let btncheckSMR = true;
  let btncheckMLAT = true;
  let btncheckADSB = true;
  let btncheckAreas = true;
  let btncheckPlanes = true;
  let btncheckPaths = true;

  initializeMap();

  // async function handleLoadFileClick() {
  //   numberOfMsg = Number.parseInt(await initIpcMainBidirectional("test-receive"));
  //   const chunks = 10000;
  //   console.log(`Loaded ${numberOfMsg} messages!`);

  //   while (messages.length < numberOfMsg) {
  //     if (numberOfMsg - messages.length > chunks) {
  //       const res = await ipcMainBidirectional("get-message-quantity", chunks);
  //       messages.push(await parseIpcMainReceiveMessage(res));
  //     } else {
  //       const res = await ipcMainBidirectional("get-message-quantity", numberOfMsg - messages.length);
  //       messages.push(await parseIpcMainReceiveMessage(res));
  //     }
  //   }
  //   console.log("Finished loading");

  //   //simulationComponent.initializeSimulation(messages);
  // }

  async function handleLoadSomeMsgs() {
    messages = [];
    numberOfMsg = Number.parseInt(await initIpcMainBidirectional("file-picker"));
    loading = true;
    console.log({ numberOfMsg });
    const FRAGMENTS = 10000;
    let i = 0;

    await ipcMainBidirectional("get-message-quantity", 10000);
    ipcMainBidirectional("compute-parameters");
    while (i < numberOfMsg) {
      const msgs = await ipcMainBidirectional("pass-slice");

      messages = messages.concat(await parseIpcMainReceiveMessage(msgs));
      i += FRAGMENTS;
    }
    console.log(`Finished loading ${messages.length} messages!`);

    simulationComponent.initializeSimulation!(messages);
    loading = false;
  }

  // async function handleLoadSomeMsgs2() {
  //   numberOfMsg = Number.parseInt(await initIpcMainBidirectional("test-receive"));
  //   const res = await ipcMainBidirectional("get-message-quantity2", 10000);
  //   messages = await parseIpcMainReceiveMessage(res);
  //   console.log(`Finished loading ${messages.length} messages!`);

  //   simulationComponent.initializeSimulation!(messages);
  // }

  async function handleMapClick() {
    visibleItem = "MAP";
    initializeMap();
    if (messages.length > 0) {
      setTimeout(() => {
        simulationComponent.initializeSimulation!(messages);
      }, 750);
    }
  }

  async function handleMessageDecoderClick() {
    visibleItem = "MESSAGE_DECODER";
  }

  async function handleParametersResultsClick() {
    visibleItem = "PARAMETERS_RESULTS";
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

  function settingsPannel() {
    settings = !settings;
  }
</script>

<main>
  <div class="{visibleItem === 'MAP' ? 'main overflow' : 'main'}">
    {#if messages.length > 0}
      <ul class="nav nav-tabs">
        <li class="nav-item" on:click="{handleMapClick}">
          <a class="{visibleItem === 'MAP' ? 'nav-link active' : 'nav-link'}" href="#a">MAP</a>
        </li>
        <li class="nav-item" on:click="{handleMessageDecoderClick}">
          <a class="{visibleItem === 'MESSAGE_DECODER' ? 'nav-link active' : 'nav-link'}" href="#a">Table view</a>
        </li>
        <li class="nav-item" on:click="{handleParametersResultsClick}">
          <a class="{visibleItem === 'PARAMETERS_RESULTS' ? 'nav-link active' : 'nav-link'}" href="#a"
            >ED-117 Parameters</a
          >
        </li>
      </ul>
    {:else}
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link active" href="#a">MAP</a>
        </li>
        <li class="nav-item">
          <a class="nav-link disabled" href="#a">Table view</a>
        </li>
        <li class="nav-item">
          <a class="nav-link disabled" href="#a">ED-117 Parameters</a>
        </li>
      </ul>
    {/if}
    {#if visibleItem === "MAP"}
      {#if settings}
        <div class="ontop dark" id="settings" transition:fade="{{ duration: 100 }}">
          <p>Visible Layers</p>

          <div role="group" aria-label="Basic checkbox toggle button group">
            <input
              type="checkbox"
              bind:checked="{btncheckSMR}"
              on:change="{(e) => {
                //@ts-ignore
                setSMRVisibility(e.target.checked);
              }}"
              class="btn-check"
              id="btncheckSMR"
              autocomplete="off"
            />
            <label class="btn btn-outline-primary" for="btncheckSMR">SMR</label>

            <input
              type="checkbox"
              bind:checked="{btncheckMLAT}"
              on:change="{(e) => {
                //@ts-ignore
                setMLATVisibility(e.target.checked);
              }}"
              class="btn-check"
              id="btncheckMLAT"
              autocomplete="off"
            />
            <label class="btn btn-outline-primary" for="btncheckMLAT">MLAT</label>

            <input
              type="checkbox"
              bind:checked="{btncheckADSB}"
              on:change="{(e) => {
                //@ts-ignore
                setADSBVisibility(e.target.checked);
              }}"
              class="btn-check"
              id="btncheckADSB"
              autocomplete="off"
            />
            <label class="btn btn-outline-primary" for="btncheckADSB">ADSB</label>
          </div>
          <div class="btn-group" role="group" aria-label="Basic checkbox toggle button group">
            <input
              type="checkbox"
              bind:checked="{btncheckAreas}"
              on:change="{(e) => {
                //@ts-ignore
                setAreasLayerVisibility(e.target.checked);
              }}"
              class="btn-check"
              id="btncheckAreas"
              autocomplete="off"
            />
            <label class="btn btn-outline-primary" for="btncheckAreas">MLAT Areas</label>
          </div>
          <div role="group" aria-label="Basic checkbox toggle button group">
            <input
              type="checkbox"
              bind:checked="{btncheckPlanes}"
              on:change="{(e) => {
                //@ts-ignore
                setPlanesLayerVisibility(e.target.checked);
              }}"
              class="btn-check"
              id="btncheckPlanes"
              autocomplete="off"
            />
            <label class="btn btn-outline-primary" for="btncheckPlanes">3D Planes</label>

            <input
              type="checkbox"
              bind:checked="{btncheckPaths}"
              on:change="{(e) => {
                //@ts-ignore
                setPathsLayerVisibility(e.target.checked);
              }}"
              class="btn-check"
              id="btncheckPaths"
              autocomplete="off"
            />
            <label class="btn btn-outline-primary" for="btncheckPaths">3D Paths</label>
          </div>
        </div>
      {/if}

      <div class="ontop dark" id="legend" transition:fade="{{ duration: 100 }}">
        <p>Map Legend</p>
        <div style="font-size:small">
          <tr>
            <td>
              <div class="color" style="background-color: #fe0000;"></div>
            </td>
            <td>SMR Data Point</td>
          </tr>
          <tr>
            <td>
              <div class="color" style="background-color: #ffeb16;"></div>
            </td>
            <td>MLAT Data Point</td>
          </tr>
          <tr>
            <td>
              <div class="color" style="background-color: #6733bb;"></div>
            </td>
            <td>ADS-B Data Point</td>
          </tr>
          <tr>
            <td>
              <div class="color-round" style="background-color: #fe0000;"></div>
            </td>
            <td> SMR Instrument </td>
          </tr>
          <tr>
            <td>
              <div class="color-round" style="background-color: #ffeb16;"></div>
            </td>
            <td>MLAT Instrument</td>
          </tr>
          {#if btncheckAreas === true}
            MLAT Performance Zones
            <tr>
              <td>
                <div class="color-area" style="background-color: rgba(103, 51, 187, 0.6);"></div>
              </td>
              <td>Airborne</td>
            </tr>
            <tr>
              <td>
                <div class="color-area" style="background-color: rgba(227, 139, 79, 0.8);"></div>
              </td>
              <td>Runway</td>
            </tr>
            <tr>
              <td>
                <div class="color-area" style="background-color: rgba(0, 255, 0, 0.6);"></div>
              </td>
              <td>Taxi</td>
            </tr>
            <tr>
              <td>
                <div class="color-area" style="background-color: rgba(255, 0, 0, 0.6);"></div>
              </td>
              <td>Apron</td>
            </tr>
            <tr>
              <td>
                <div class="color-area" style="background-color: rgba(51, 51, 51, 0.8);"></div>
              </td>
              <td>Stand</td>
            </tr>
          {/if}
        </div>
      </div>
      <div class="ontop dark" id="btn-bar">
        <div id="progDiv">
          <Simulation
            on:stop="{() => (play = false)}"
            on:switchplay="{() => (play = !play)}"
            bind:this="{simulationComponent}"
          />
        </div>
        <div>
          <button type="button" class="btn btn-primary" on:click="{handleLoadSomeMsgs}"
            ><i class="bi bi-folder2-open"></i></button
          >

          <button
            type="button"
            class="{messages.length > 0 ? 'btn btn-primary' : 'btn btn-primary disabled'}"
            on:click="{csv_file}"
            ><i class="bi bi-filetype-csv"></i>
          </button>
          <button type="button" class="btn btn-primary me-3" on:click="{settingsPannel}"
            ><i class="bi bi-gear"></i>
          </button>
          <button
            type="button"
            class="{messages.length > 0 ? 'btn btn-primary' : 'btn btn-primary disabled'}"
            on:click="{simulationComponent.backwardsTick}"><i class="bi bi-arrow-90deg-left"></i></button
          >
          <button
            type="button"
            class="{messages.length > 0 ? 'btn btn-primary' : 'btn btn-primary disabled'}"
            on:click="{simulationComponent.restartSim}"
            ><i class="bi bi-arrow-counterclockwise"></i>
          </button>

          <button
            type="button"
            class="{messages.length > 0 ? 'btn btn-primary' : 'btn btn-primary disabled'}"
            on:click="{simulationComponent.playClick}"
          >
            {#if play}
              <i class="bi bi-pause"></i>
            {:else}
              <i class="bi bi-play"></i>
            {/if}
          </button>

          <button
            type="button"
            class="{messages.length > 0 ? 'btn btn-primary' : 'btn btn-primary disabled'}"
            on:click="{simulationComponent.forwardsTick}"
            ><i class="bi bi-arrow-90deg-right"></i>
          </button>
        </div>
      </div>

      <div class="{settings ? 'top-planes ontop' : 'bottom-planes ontop'}" id="planes">
        <PlanesComponent />
      </div>

      <div id="viewDiv"></div>
    {/if}

    {#if visibleItem === "MESSAGE_DECODER"}
      <div>
        <ExpandableTable />
      </div>
    {/if}
    {#if visibleItem === "PARAMETERS_RESULTS"}
      <div>
        <ParametersTable />
      </div>
    {/if}
  </div>

  {#if loading == true}
    <div id="overlay">
      <div class="d-flex justify-content-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  {/if}
</main>
