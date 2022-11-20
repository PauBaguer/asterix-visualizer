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
  import { createGraphic } from "../../arcgis/groundLayer";

  let messages: (Cat10 | Cat21)[] = [];
  let msgToPlot: (Cat10 | Cat21)[];

  let simStartTime = 0;
  let simTime = 0;
  const tick = 10 * 60000; //10 minutes per tick
  let simEndTime = 36062 * 1000; //this is for the cat 10 file. make dynamic!!

  let play = false;
  let timer: number;

  export function initializeSimulation(msgs: (Cat10 | Cat21)[]) {
    messages = msgs;
    msgToPlot = msgs;

    if (messages[0].class === "Cat10") {
      simStartTime = getDateCat10(messages[0]).getTime();
    } else {
      simStartTime = getDateCat21(messages[0]).getTime();
    }
    simTime = simStartTime;
    tickSimulation();
  }

  export function tickSimulation() {
    simTime += tick;
    console.log(simTime);
    console.log(round(simTime / (simEndTime - simStartTime)));

    for (const [index, value] of msgToPlot.entries()) {
      if (value.class === "Cat10") {
        if (Date.parse(value.time_of_day) > simTime) break;

        if (value.message_type !== "Target Report") break;

        createGraphic(value);

        msgToPlot.splice(index, 1);
      } else {
        //cat21
      }
    }
  }

  export function playClick() {
    play = !play;
    if (play) timer = window.setInterval(tickSimulation, 500);
    else clearInterval(timer);
  }

  export function forwardsTick() {}

  export function backwardsTick() {}

  function getDateCat10(m: Cat10) {
    let d = new Date("1970-01-01T" + m.time_of_day);
    console.log("1970-01-01T" + m.time_of_day);
    console.log(d);
    return d;
  }

  function getDateCat21(m: Cat21) {
    return new Date(m.time_ASTERIX_report_transmission * 1000);
  }

  function round(num: number) {
    return Math.round(num * 100) / 100;
  }
</script>

<div>
  {#if messages.length > 0}
    <div class="progress">
      <div id="textDiv">{round(simTime / (simEndTime - simStartTime))}%</div>
      <div
        class="{play ? 'progress-bar progress-bar-striped progress-bar-animated' : 'progress-bar progress-bar-striped'}"
        role="progressbar"
        aria-label="Simulation progress"
        style="width: {round(simTime / (simEndTime - simStartTime))}%;"
        aria-valuenow="{round(simTime / (simEndTime - simStartTime))}"
        aria-valuemin="{0}"
        aria-valuemax="{100}"
      ></div>
    </div>
  {/if}
</div>
