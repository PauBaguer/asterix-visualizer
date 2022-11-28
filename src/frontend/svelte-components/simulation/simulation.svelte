<style>
  #textDiv {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
  }
</style>

<script lang="ts">
  import type { Cat10 } from "../../custom-types/asterix/cat10";
  import type { Cat21 } from "../../custom-types/asterix/cat21";
  import {
    createGraphicSMR,
    createGraphicMLAT,
    clearMap,
    deleteGraphicSMR,
    deleteGraphicMLAT,
    deleteGraphicADSB,
    createGraphicADSB,
  } from "../../arcgis/groundLayer";
  import { createEventDispatcher } from "svelte";
  import {
    clearGraphicsLayer,
    deleteADSBmessage,
    deleteMLATmessage,
    parseADSBmessage,
    parseMLATmessage,
  } from "../../arcgis/graphicsLayer";

  let messages: (Cat10 | Cat21)[] = [];
  // let msgToPlot: (Cat10 | Cat21)[] = [];
  // let msgPlotted: (Cat10 | Cat21)[] = [];
  const dispatch = createEventDispatcher();

  let i = 0;
  let slider = 1;
  let simStartTime = 0;
  let simTime = 0;
  const tick = 1000; //1 secconds per tick
  let simEndTime = 0; //this is for the cat 10 file. make dynamic!!

  let play = false;
  let timer: number;

  export function initializeSimulation(msgs: (Cat10 | Cat21)[]) {
    i = 0;

    messages = msgs;
    // msgToPlot.push(...msgs);
    // msgPlotted = [];

    if (messages[0].class === "Cat10") {
      simStartTime = getDateCat10(messages[0]).getTime();
    } else {
      simStartTime = getDateCat21(messages[0]).getTime();
    }

    if (messages[messages.length - 1].class === "Cat10") {
      simEndTime = getDateCat10(messages[messages.length - 1] as Cat10).getTime();
    } else {
      simEndTime = getDateCat21(messages[messages.length - 1] as Cat21).getTime();
    }

    simTime = simStartTime;
  }

  function getTime(msg: Cat10 | Cat21) {
    if (msg.class === "Cat10") {
      return msg.time_of_day;
    } else if (msg.class === "Cat21") return msg.time_ASTERIX_report_transmission;
    return -1;
  }

  function tickSimulation() {
    if (simTime === simEndTime) return;
    if (simTime + tick * slider > simEndTime) {
      simTime = simEndTime;
      stop();
    } else simTime += tick * slider;

    while (getTime(messages[i]) * 1000 < simTime) {
      if (messages[i].class === "Cat10") {
        //cat10
        const msg = messages[i] as Cat10;
        if (msg.message_type === "Target Report") {
          if (msg.data_source_identifier.SIC == "107") {
            createGraphicMLAT(msg);
            parseMLATmessage(msg);
          } else if (msg.data_source_identifier.SIC === "7") createGraphicSMR(msg);
        }
      } else {
        //cat21
        const msg = messages[i] as Cat21;
        createGraphicADSB(msg);
        parseADSBmessage(msg);
      }
      i += 1;
    }
  }

  function tickBackSimulation() {
    if (simTime === simStartTime) return;
    if (simTime - tick * slider < simStartTime) {
      simTime = simStartTime;
    } else simTime -= tick * slider;

    if (i < 0) i = 0;

    while (getTime(messages[i]) * 1000 > simTime) {
      if (messages[i].class === "Cat10") {
        //cat10
        const msg = messages[i] as Cat10;
        if (msg.message_type === "Target Report") {
          if (msg.data_source_identifier.SIC == "107") {
            deleteGraphicMLAT(msg);
            deleteMLATmessage(msg);
          } else if (msg.data_source_identifier.SIC == "7") deleteGraphicSMR(msg);
        }
      } else {
        //cat21
        const msg = messages[i] as Cat21;
        deleteGraphicADSB(msg);
        deleteADSBmessage(msg);
      }
      i -= 1;
      if (i < 0) {
        i = 0;
        break;
      }
    }
  }

  export function playClick() {
    play = !play;
    dispatch("switchplay");
    if (play) timer = window.setInterval(tickSimulation, 100);
    else clearInterval(timer);
  }
  export function stop() {
    play = false;
    dispatch("stop");
    clearInterval(timer);
  }

  export function restartSim() {
    stop();
    simTime = 0;
    clearMap();
    clearGraphicsLayer();
    initializeSimulation(messages);
  }

  export function forwardsTick() {
    stop();
    tickSimulation();
  }

  export function backwardsTick() {
    stop();
    tickBackSimulation();
  }

  function getDateCat10(m: Cat10) {
    return new Date(m.time_of_day * 1000);
  }

  function getDateCat21(m: Cat21) {
    return new Date(m.time_ASTERIX_report_transmission * 1000);
  }

  function getDateFromMilis(milis: number) {
    const d = new Date(milis);

    return d.toISOString().substring(11, 23);
  }

  function round(num: number) {
    return Math.round(num * 100) / 100;
  }
</script>

<div>
  {#if messages.length > 0}
    <div class="progress">
      <div id="textDiv">
        {getDateFromMilis(simTime)}
      </div>
      <div
        class="{play ? 'progress-bar progress-bar-striped progress-bar-animated' : 'progress-bar progress-bar-striped'}"
        role="progressbar"
        aria-label="Simulation progress"
        style="width: {round(((simTime - simStartTime) / (simEndTime - simStartTime)) * 100)}%;"
        aria-valuenow="{round(((simTime - simStartTime) / (simEndTime - simStartTime)) * 100)}"
        aria-valuemin="{0}"
        aria-valuemax="{100}"
      ></div>
    </div>
    <div style="width: 100%; display: table; padding-top: 3px;">
      <div style="display: table-row">
        <div style="width: 40px; display: table-cell;">
          <label for="range" class="form-label">x{Math.round(10 * slider)}</label>
        </div>
        <div style="display: table-cell;">
          <input bind:value="{slider}" type="range" class="form-range" min="0.1" max="2" step="0.1" id="range" />
        </div>
      </div>
    </div>
  {/if}
</div>
