<style>
  #cont {
    padding-top: 10px;
  }
</style>

<script>
  import { onMount } from "svelte";
  import jQuery from "jquery";

  import GenericProps from "./cat10_items/GenericProps.svelte";
  import { initIpcMainBidirectional, ipcMainBidirectional, ipcMainOneDirection } from "../../ipcMain/ipcMainCallers";
  import { parseIpcMainReceiveMessage } from "../../ipcMain/ipcMainReceiveParser";

  let el; //table element
  let table; // table object api

  onMount(async () => {
    await load();
    table = jQuery(el).DataTable({
      rows: [
        {
          child: '<slot name="footer"></slot>',
        },
      ],
    });
  });

  let allChildComponents = {};
  let allChildComponentsKeys = Object.keys(allChildComponents);

  function trClick(msg) {
    let tr = document.getElementById(`tr-${msg.id}`);
    let tbody = document.querySelector("tbody");
    if (allChildComponents.hasOwnProperty(msg.id)) {
      // This row is already open - close it

      tr.classList.remove("shown");
      allChildComponents[msg.id].$destroy();
      delete allChildComponents[msg.id];
      allChildComponentsKeys = Object.keys(allChildComponents);
    } else {
      // Open this row
      tr.classList.add("shown");
      let arr = Array.from(tbody.children);
      let nexttr = arr[arr.indexOf(tr) + 1];
      let child = new GenericProps({ target: tbody, anchor: nexttr, props: { msg } });
      allChildComponents[msg.id] = child;
      allChildComponentsKeys = Object.keys(allChildComponents);
    }
  }

  //document.getElementsByClassName("dataTables_lenght").addClass("bs-select");

  export let messages;
  export let numberOfMsg;

  async function load() {
    // const chunks = 20000;

    // while (messages.length < numberOfMsg) {
    //   if (numberOfMsg - messages.length > chunks) {
    //     const res = await ipcMainBidirectional("get-message-quantity", chunks);
    //     messages.push(await parseIpcMainReceiveMessage(res));
    //   } else {
    //     const res = await ipcMainBidirectional("get-message-quantity", numberOfMsg - messages.length);
    //     messages.push(await parseIpcMainReceiveMessage(res));
    //   }
    // }
    const res = await ipcMainBidirectional("get-message-quantity", 2000);
    messages = await parseIpcMainReceiveMessage(res);

    console.log("Finished loading");
  }

  //1970-01-01T08:00:01.734Z
</script>

<div class="container" id="cont">
  <div class="col-md-16">
    <div class="panel panel-default">
      <div class="panel-body">
        <table
          id="mainTable"
          bind:this="{el}"
          class="display table table-condensed table-striped table-bordered table-sm"
          cellspacing="0"
        >
          <thead>
            <tr>
              <th></th>
              <th>Id</th>
              <th>Class</th>
              <th>Message Type / Target Id</th>
              <th>Data source identifier</th>
              <th>Instrument</th>
              <th>Time of Day</th>
            </tr>
          </thead>
          <tbody>
            {#each messages as msg, i}
              {#if msg.class === "Cat10"}
                <tr on:click="{() => trClick(msg)}" id="tr-{msg.id}">
                  <td
                    ><button class="btn btn-default btn-xs">
                      {#if allChildComponentsKeys.includes(msg.id.toString())}
                        <i class="bi bi-arrow-down-short"></i>
                      {:else}
                        <i class="bi bi-arrow-right-short"></i>
                      {/if}
                    </button></td
                  >
                  <td>{msg.id}</td>
                  <td>{msg.class}</td>
                  <td>{msg.message_type}</td>
                  <td>{`SIC: ${msg.data_source_identifier.SIC}; SAC: ${msg.data_source_identifier.SAC}`}</td>
                  <td>{msg.instrument}</td>
                  <td>{new Date(msg.time_of_day * 1000).toISOString().substring(11, 23)}</td>
                </tr>
              {:else}
                <tr on:click="{() => trClick(msg)}" id="tr-{msg.id}">
                  <td
                    ><button class="btn btn-default btn-xs">
                      {#if allChildComponentsKeys.includes(msg.id.toString())}
                        <i class="bi bi-arrow-down-short"></i>
                      {:else}
                        <i class="bi bi-arrow-right-short"></i>
                      {/if}
                    </button></td
                  >
                  <td>{msg.id}</td>
                  <td>{msg.class}</td>
                  <td>{msg.target_identification}</td>
                  <td>{`SIC: ${msg.data_source_identifier.SIC}; SAC: ${msg.data_source_identifier.SAC}`}</td>
                  <td>{msg.instrument}</td>
                  <td>{new Date(msg.time_ASTERIX_report_transmission * 1000).toISOString().substring(11, 23)}</td>
                </tr>{/if}
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
