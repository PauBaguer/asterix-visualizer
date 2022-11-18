<style>
  #cont {
    padding-top: 10px;
  }
</style>

<script>
  import CartesianCoordinates from "./cat10_items/CartesianCoordinates.svelte";
  import GenericComponent from "./cat10_items/GenericComponent.svelte";
  import TargetReportDescription from "./cat10_items/TargetReportDescription.svelte";
  import { onMount } from "svelte";
  import jQuery from "jquery";

  import GenericProps from "./cat10_items/GenericProps.svelte";

  let el; //table element
  let table; // table object api

  onMount(async () => {
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

  function trClick(id) {
    let tr = document.getElementById(`tr-${id}`);
    let tbody = document.querySelector("tbody");
    if (allChildComponents.hasOwnProperty(id)) {
      // This row is already open - close it

      tr.classList.remove("shown");
      allChildComponents[id].$destroy();
      delete allChildComponents[id];
      allChildComponentsKeys = Object.keys(allChildComponents);
    } else {
      // Open this row
      tr.classList.add("shown");
      let arr = Array.from(tbody.children);
      let nexttr = arr[arr.indexOf(tr) + 1];
      let child = new GenericProps({ target: tbody, anchor: nexttr });
      allChildComponents[id] = child;
      allChildComponentsKeys = Object.keys(allChildComponents);
    }
  }

  //document.getElementsByClassName("dataTables_lenght").addClass("bs-select");

  export let messages;
  let renderedMessges = messages.slice(0, 20);
  const pageNumber = Math.round(messages.length / 20);
  const pageArray = Array.from({ length: pageNumber }, (_, i) => i + 1);
  let displayedPageArray = pageArray.slice(0, 7);
  let activePage = 1;

  function handlePageClick(page) {
    if (pageArray.includes(page)) {
      activePage = page;
      if (activePage - 3 < 1) {
        displayedPageArray = pageArray.slice(0, 7);
      } else if (activePage + 3 > pageArray.length) {
        displayedPageArray = pageArray.slice(activePage - 5, pageArray.length);
      } else {
        displayedPageArray = pageArray.slice(activePage - 4, activePage + 3);
      }
      renderedMessges = messages.slice((page - 1) * 20, page * 20);
    }
  }
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
              <th>Message Type</th>
              <th>Data source identifier</th>
              <th>Time of Day</th>
            </tr>
          </thead>
          <tbody>
            {#each messages as msg, i}
              <tr on:click="{() => trClick(msg.id)}" id="tr-{msg.id}">
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
                <td>{`${msg.data_source_identifier.SIC} ${msg.data_source_identifier.SAC}`}</td>
                <td>{msg.time_of_day}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
