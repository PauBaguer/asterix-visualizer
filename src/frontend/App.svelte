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
      "id,class,message_type,data_source_identifier,target_report_description,wgs_84_coordinates,polar_coordinates,cartesian_coordinates,calculated_track_velocity_polar_coordinates,calculated_track_velocity_cartesian_coordinates,mod_3A_code,flight_level,measured_height,altitude_of_primary_plot,time_of_day,track_number,track_status,calculated_acceleration,target_address,target_identification,mode_s_mb_data,target_size_and_orientation,presence,vehicle_fleet_identification,preprogrammed_message,standard_deviation_of_position,system_status,aircraft_operational_status,service_identification,service_management,emitter_category,target_report_descriptor,time_applicability_position,time_applicability_velocity,time_message_reception_position,time_message_reception_position_high,time_message_reception_velocity,time_message_reception_velocity_high,time_ASTERIX_report_transmission,quality_indicator,tarjectory_intent,wgs_84_coordinates_high,message_amplitude,geometric_height,selected_altitude,final_state_selected_altitude,air_speed,true_airspeed,magnetic_heading,barometric_vertical_rate,geometric_vertical_rate,airborne_ground_vector,track_angle_rate,target_status,mops_version,met_information,roll_angle,acas_resolution_advisory_report,surface_capabilities_and_characteristics,receiver_ID";

    messages.forEach((value) => {
      csvContent += value.csv.join(",") + "\n";
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
