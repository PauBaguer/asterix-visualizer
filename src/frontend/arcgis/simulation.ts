import type { Cat10 } from "../custom-types/asterix/cat10";
import type { Cat21 } from "../custom-types/asterix/cat21";
import { createGraphic } from "../arcgis/groundLayer";

let messages: (Cat10 | Cat21)[];
let msgToPlot: (Cat10 | Cat21)[];

let simStartTime = 0;
let simTime = 0;
const tick = 1000;

export function initializeSimulation(msgs: (Cat10 | Cat21)[]) {
  messages = msgs;
  msgToPlot = msgs;

  if (messages[0].class === "Cat10") simStartTime = Date.parse(messages[0].time_of_day);
  simTime = simStartTime;
  tickSimulation();
}

export function tickSimulation() {
  simTime += tick;

  for (const [index, value] of msgToPlot.entries()) {
    if (value.class === "Cat10") {
      if (Date.parse(value.time_of_day) > simTime) break;

      //blablabla
      createGraphic(value);

      msgToPlot.splice(index, 1);
    } else {
      //cat21
    }
  }
}
