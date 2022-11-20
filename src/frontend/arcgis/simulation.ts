import type { Cat10 } from "../custom-types/asterix/cat10";
import type { Cat21 } from "../custom-types/asterix/cat21";
import { createGraphic } from "../arcgis/groundLayer";

let messages: (Cat10 | Cat21)[];
let msgToPlot: (Cat10 | Cat21)[];

let simStartTime = 0;
let simTime = 0;
const tick = 1000;
let simEndTime = 36062 * 1000; //this is for the cat 10 file. make dynamic!!

export function initializeSimulation(msgs: (Cat10 | Cat21)[]) {
  messages = msgs;
  msgToPlot = msgs;

  if (messages[0].class === "Cat10") {
    simStartTime = getDateCat10(messages[0]).getMilliseconds();
  } else {
    simStartTime = getDateCat21(messages[0]).getMilliseconds();
  }
  simTime = simStartTime;
  tickSimulation();
}

export function tickSimulation() {
  simTime += tick;

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

export function forwardsTick() {}

export function backwardsTick() {}

function getDateCat10(m: Cat10) {
  return new Date("1970-01-01T" + m.time_of_day);
}

function getDateCat21(m: Cat21) {
  return new Date(m.time_ASTERIX_report_transmission * 1000);
}
