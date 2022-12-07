import { isPointInPolygon, getDistance } from 'geolib';

const rwy06R = [
  { longitude: 2.073544428747862, latitude: 41.282322777493 },
  { longitude: 2.1038044835174534, latitude: 41.292695924731504 },
  { longitude: 2.104090847313795, latitude: 41.29222048305417 },
  { longitude: 2.07382476073992, latitude: 41.28186917069003 },
  { longitude: 2.073544428747862, latitude: 41.282322777493 },
];

const rwy06L = [
  { longitude: 2.065580784730532, latitude: 41.29305232485694 },
  { longitude: 2.1049044795464513, latitude: 41.30645156655545 },
  { longitude: 2.1052273721378163, latitude: 41.305915116490716 },
  { longitude: 2.0659512374753133, latitude: 41.29242934718271 },
  { longitude: 2.065580784730532, latitude: 41.29305232485694 },
];

const rwy20 = [
  { longitude: 2.094497120222143, latitude: 41.30954117409855 },
  { longitude: 2.0950813004192828, latitude: 41.309381976193684 },
  { longitude: 2.0849565195353246, latitude: 41.287409333392745 },
  { longitude: 2.084454624379581, latitude: 41.28753586595036 },
  { longitude: 2.094497120222143, latitude: 41.30954117409855 },
];

const apronWest = [
  { longitude: 2.07340839679361, latitude: 41.28424861643785 },
  { longitude: 2.0722924007516537, latitude: 41.2846495216228 },
  { longitude: 2.0692939942631576, latitude: 41.2896632686916 },
  { longitude: 2.0670082812056854, latitude: 41.28888138929966 },
  { longitude: 2.0651771657363462, latitude: 41.28964539289708 },
  { longitude: 2.075362085809489, latitude: 41.29297348683743 },
  { longitude: 2.076448935543488, latitude: 41.29108651682509 },
  { longitude: 2.083076000127197, latitude: 41.29337438277837 },
  { longitude: 2.0838794285793614, latitude: 41.29227393381803 },
  { longitude: 2.0820426211857592, latitude: 41.2870759464837 },
  { longitude: 2.07340839679361, latitude: 41.28424861643785 },
];

const apronTop = [
  { longitude: 2.0695459488873227, latitude: 41.300539704361 },
  { longitude: 2.070951809448399, latitude: 41.3009843477467 },
  { longitude: 2.073740845317415, latitude: 41.299798907935326 },
  { longitude: 2.0846029382171016, latitude: 41.30328627826634 },
  { longitude: 2.084890978468265, latitude: 41.30275966925683 },
  { longitude: 2.0723141678681607, latitude: 41.29877235876488 },
  { longitude: 2.0695459488873227, latitude: 41.300539704361 },
];

const apronEast = [
  { longitude: 2.0878639036224214, latitude: 41.30589472786412 },
  { longitude: 2.090134405263308, latitude: 41.30668795416331 },
  { longitude: 2.0903541337159455, latitude: 41.306284210906554 },
  { longitude: 2.0897225914200805, latitude: 41.3045567489771 },
  { longitude: 2.0888586949139425, latitude: 41.30426039882101 },
  { longitude: 2.0878639036224214, latitude: 41.30589472786412 },
];

const taxi = [
  { longitude: 2.058898168373926, latitude: 41.29204493396387 },
  { longitude: 2.057556506319483, latitude: 41.29401047267355 },
  { longitude: 2.084893054138535, latitude: 41.30273980283841 },
  { longitude: 2.0848339122555495, latitude: 41.30286966146069 },
  { longitude: 2.0897439375797595, latitude: 41.30454743823659 },
  { longitude: 2.0919446267453625, latitude: 41.30956587579721 },
  { longitude: 2.093345528722446, latitude: 41.31007976477602 },
  { longitude: 2.0940260605946044, latitude: 41.31014059449381 },
  { longitude: 2.0943958199346997, latitude: 41.309484582752184 },
  { longitude: 2.0926148217927416, latitude: 41.30545981970179 },
  { longitude: 2.1018078858594147, latitude: 41.30866967423334 },
  { longitude: 2.100578817583161, latitude: 41.31055353797318 },
  { longitude: 2.0997468962579604, latitude: 41.31040270888631 },
  { longitude: 2.0974558467329016, latitude: 41.31048184674368 },
  { longitude: 2.096676960843721, latitude: 41.31124922110484 },
  { longitude: 2.0948325322535934, latitude: 41.311648072190344 },
  { longitude: 2.0940219730429854, latitude: 41.3101586056726 },
  { longitude: 2.093349394740845, latitude: 41.310095373025796 },
  { longitude: 2.09454489441944, latitude: 41.31215787218275 },
  { longitude: 2.1003221607670013, latitude: 41.311060161604516 },
  { longitude: 2.103400160883264, latitude: 41.3116790844715 },
  { longitude: 2.1025101496560645, latitude: 41.30878595591344 },
  { longitude: 2.103816738112214, latitude: 41.308408846200074 },
  { longitude: 2.1061275635375716, latitude: 41.30456022123433 },
  { longitude: 2.1053653631591565, latitude: 41.30305453158963 },
  { longitude: 2.086560036641853, latitude: 41.29662344568625 },
  { longitude: 2.085712522071191, latitude: 41.296226001283344 },
  { longitude: 2.0859740988769477, latitude: 41.29554745934924 },
  { longitude: 2.0895738950953304, latitude: 41.289815072178385 },
  { longitude: 2.0897859294185084, latitude: 41.28983605793412 },
  { longitude: 2.099026489388453, latitude: 41.29294823410928 },
  { longitude: 2.0992023632588697, latitude: 41.29312674726655 },
  { longitude: 2.100905648627836, latitude: 41.293726968733196 },
  { longitude: 2.10163777663574, latitude: 41.293959373002984 },
  { longitude: 2.1020097583615516, latitude: 41.293977670233204 },
  { longitude: 2.102689994259114, latitude: 41.293854750910164 },
  { longitude: 2.102894849995388, latitude: 41.29373721750032 },
  { longitude: 2.103550169913081, latitude: 41.29261076177145 },
  { longitude: 2.0735327121303966, latitude: 41.28232376163093 },
  { longitude: 2.0729432724858508, latitude: 41.2832949287332 },
  { longitude: 2.0729904439340063, latitude: 41.283719599405025 },
  { longitude: 2.073406291476514, latitude: 41.28424681162829 },
  { longitude: 2.0820250861807517, latitude: 41.28708247490496 },
  { longitude: 2.083891107262406, latitude: 41.29224143867939 },
  { longitude: 2.0830373558694437, latitude: 41.293450808462836 },
  { longitude: 2.0822295697340727, latitude: 41.29526630177341 },
  { longitude: 2.076329381875978, latitude: 41.29327544458598 },
  { longitude: 2.077370499140386, latitude: 41.29141143059173 },
  { longitude: 2.0764516458942275, latitude: 41.29111785437606 },
  { longitude: 2.0753625532473436, latitude: 41.29297627995079 },
  { longitude: 2.065200143883595, latitude: 41.28964218247223 },
  { longitude: 2.058898168373926, latitude: 41.29204493396387 },
];

const standNW = [
  { longitude: 2.057566419766411, latitude: 41.29401143749593 },
  { longitude: 2.056232243532431, latitude: 41.29604385446611 },
  { longitude: 2.0695327803170485, latitude: 41.30054602929275 },
  { longitude: 2.0723533069392293, latitude: 41.29873961634782 },
  { longitude: 2.057566419766411, latitude: 41.29401143749593 },
];

const standNE = [
  { longitude: 2.0709480477699493, latitude: 41.30098577881595 },
  { longitude: 2.087590820806823, latitude: 41.307172605063904 },
  { longitude: 2.0871856619037885, latitude: 41.307902279289024 },
  { longitude: 2.09030926874566, latitude: 41.3090181801594 },
  { longitude: 2.0899032256953087, latitude: 41.309766014965476 },
  { longitude: 2.0911971603113644, latitude: 41.31021606992266 },
  { longitude: 2.091549093851093, latitude: 41.30946478361383 },
  { longitude: 2.09013438075815, latitude: 41.3066878771161 },
  { longitude: 2.087863147322325, latitude: 41.3058920612893 },
  { longitude: 2.0888660645535104, latitude: 41.30424924118878 },
  { longitude: 2.084832005010937, latitude: 41.30287049661829 },
  { longitude: 2.084602174907319, latitude: 41.3032850458234 },
  { longitude: 2.073729049959174, latitude: 41.299803330448455 },
  { longitude: 2.0709480477699493, latitude: 41.30098577881595 },
];

const standSW = [
  { longitude: 2.0692959594972384, latitude: 41.28966328734533 },
  { longitude: 2.068888034765739, latitude: 41.29028579820083 },
  { longitude: 2.0751591327565686, latitude: 41.29238773077241 },
  { longitude: 2.0761745605719995, latitude: 41.290628245712355 },
  { longitude: 2.082972164249711, latitude: 41.29296147135941 },
  { longitude: 2.0835473886613003, latitude: 41.29183233922605 },
  { longitude: 2.083016575338188, latitude: 41.29068536814547 },
  { longitude: 2.077749250219631, latitude: 41.28888680967324 },
  { longitude: 2.0787009037398683, latitude: 41.28724580674123 },
  { longitude: 2.0721004959351004, latitude: 41.28496838662873 },
  { longitude: 2.0692959594972384, latitude: 41.28966328734533 },
];

const standSE = [
  { longitude: 2.076330901708541, latitude: 41.29327324068922 },
  { longitude: 2.082223350452633, latitude: 41.29526439187278 },
  { longitude: 2.083079403462817, latitude: 41.29336900204539 },
  { longitude: 2.0773779099936402, latitude: 41.29141464192244 },
  { longitude: 2.076330901708541, latitude: 41.29327324068922 },
];

const airborne1 = [
  { longitude: 2.071865497417063, latitude: 41.29511110793517 },
  { longitude: 2.072158956594813, latitude: 41.294619661743106 },
  { longitude: 2.054924082006922, latitude: 41.28531360680459 },
  { longitude: 2.0521489503744132, latitude: 41.29253179181472 },
  { longitude: 2.071865497417063, latitude: 41.29511110793517 },
];

const airborne2 = [
  { longitude: 2.1035893919564717, latitude: 41.30596837524863 },
  { longitude: 2.120496624604457, latitude: 41.31751815740264 },
  { longitude: 2.125422261678434, latitude: 41.30981114953884 },
  { longitude: 2.1038732002253835, latitude: 41.30548156157961 },
  { longitude: 2.1035893919564717, latitude: 41.30596837524863 },
];

const airborne3 = [
  { longitude: 2.074193750587927, latitude: 41.282547142775485 },
  { longitude: 2.074464395678444, latitude: 41.282087084282104 },
  { longitude: 2.0571723027600743, latitude: 41.27254586230649 },
  { longitude: 2.053708408767759, latitude: 41.28051709501492 },
  { longitude: 2.074193750587927, latitude: 41.282547142775485 },
];

const airborne4 = [
  { longitude: 2.1034107192374742, latitude: 41.291983563058004 },
  { longitude: 2.103142290574515, latitude: 41.29246685941843 },
  { longitude: 2.123335119056207, latitude: 41.30625649674507 },
  { longitude: 2.127920815153932, latitude: 41.29690142534238 },
  { longitude: 2.1034107192374742, latitude: 41.291983563058004 },
];

const airborne5 = [
  { longitude: 2.0944167204327298, latitude: 41.30935050491175 },
  { longitude: 2.0969102992010282, latitude: 41.32681424580336 },
  { longitude: 2.105965573112122, latitude: 41.32376821661963 },
  { longitude: 2.0949107632325785, latitude: 41.30922541971759 },
  { longitude: 2.0944167204327298, latitude: 41.30935050491175 },
];

const airborne6 = [
  { longitude: 2.0845747016722433, latitude: 41.28780029727091 },
  { longitude: 2.0850803194373535, latitude: 41.287690180245015 },
  { longitude: 2.0827974003961294, latitude: 41.27020764095785 },
  { longitude: 2.0745660380367976, latitude: 41.2739004122815 },
  { longitude: 2.0845747016722433, latitude: 41.28780029727091 },
];

export function getAreaLayerPoint(lat: number, lon: number) {
  let point = { latitude: lat, longitude: lon };

  if (isPointInPolygon(point, rwy06R)) { return "RWY24L"; }

  if (isPointInPolygon(point, rwy06L)) { return "RWY24R"; }

  if (isPointInPolygon(point, rwy20)) { return "RWY02"; }

  if (isPointInPolygon(point, taxi)) { return "Taxi"; }

  if (isPointInPolygon(point, apronWest)) { return "ApronT1"; }

  if (isPointInPolygon(point, apronTop) || isPointInPolygon(point, apronEast)) { return "ApronT2"; }

  if (isPointInPolygon(point, standSW) || isPointInPolygon(point, standSE)) { return "StandT1"; }

  if (isPointInPolygon(point, standNW) || isPointInPolygon(point, standNE)) { return "StandT2"; }

  if (isPointInPolygon(point, airborne1) || isPointInPolygon(point, airborne2) || isPointInPolygon(point, airborne3) || isPointInPolygon(point, airborne4) || isPointInPolygon(point, airborne5) || isPointInPolygon(point, airborne6)) {
    const distance = getDistance(point, { latitude: 41.29706278, longitude: 2.078447222 }) / 1852;
    if (distance < 2.5) { return "Airbone2.5"; }
    if (distance <= 5) { return "Airbone5"; }
    return "Airbone10";
  }
  return "";
}

export function isPointInArea(lat: number, lon: number, areas: string[]) {
  let point = { latitude: lat, longitude: lon };

  let res = areas.findIndex((area) => {
    switch (area) {
      case "RWY": {
        if (isPointInPolygon(point, rwy06R) || isPointInPolygon(point, rwy06L) || isPointInPolygon(point, rwy20)) {
          return true;
        }
        break;
      }
      case "Taxi": {
        if (isPointInPolygon(point, taxi)) {
          return true;
        }
        break;
      }
      case "Apron": {
        if (isPointInPolygon(point, apronWest) || isPointInPolygon(point, apronEast) || isPointInPolygon(point, apronTop)) {
          return true;
        }
        break;
      }
      case "Stand": {
        if (isPointInPolygon(point, standSW) || isPointInPolygon(point, standSE) || isPointInPolygon(point, standNW) || isPointInPolygon(point, standNE)) {
          return true;
        }
        break;
      }
      case "Airbone": {
        if (isPointInPolygon(point, airborne1) || isPointInPolygon(point, airborne2) || isPointInPolygon(point, airborne3) || isPointInPolygon(point, airborne4) || isPointInPolygon(point, airborne5) || isPointInPolygon(point, airborne6)) {
          return true;
        }
        break;
      }
    }
    return false;
  });
  if (res === -1) {
    return false;
  }
  return true;

}
