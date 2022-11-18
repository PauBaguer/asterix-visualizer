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

  function trClick(id) {
    let tr = document.getElementById(`tr-${id}`);
    let tbody = document.querySelector("tbody");
    if (allChildComponents.hasOwnProperty(id)) {
      // This row is already open - close it

      tr.classList.remove("shown");
      allChildComponents[id].$destroy();
      delete allChildComponents[id];
    } else {
      // Open this row
      tr.classList.add("shown");
      let arr = Array.from(tbody.children);
      let nexttr = arr[arr.indexOf(tr) + 1];
      let child = new GenericProps({ target: tbody, anchor: nexttr });
      allChildComponents[id] = child;
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
                  ><button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-eye-open"></span></button
                  ></td
                >
                <td>{msg.id}</td>
                <td>{msg.class}</td>
                <td>{msg.message_type}</td>
                <td>{`${msg.data_source_identifier.SIC} ${msg.data_source_identifier.SAC}`}</td>
                <td>{msg.time_of_day}</td>
                <!-- {:else if msg.class === "Cat21"}
                  <td>{msg.id}</td>
                  <td>{msg.class}</td>
                  <td>{msg.service_identification}</td>
                  <td>{msg.data_source_identifier}</td>
                  <td>tbd</td> -->
              </tr>

              <!-- <tr>
                <td colspan="12" class="hiddenRow">
                  <div class="accordian-body collapse" id="{`demo${i}`}">
                    {#each Object.keys(msg) as key, j}
                      <a
                        class="btn btn-primary"
                        data-toggle="collapse"
                        href="#multiCollapseExample1"
                        role="button"
                        aria-expanded="false"
                        aria-controls="multiCollapseExample1">key</a
                      >
                      <div class="collapse multi-collapse" id="multiCollapseExample1">
                        worked?
                         {#if key === "target_report_description" && msg.class === "Cat10"}
                            <TargetReportDescription
                              i="{i}"
                              j="{j}"
                              targetReportDescription="{msg.target_report_description}"
                            />
                          {:else if key === "cartesian_coordinates" && msg.class === "Cat10"}
                            <CartesianCoordinates i="{i}" j="{j}" cartesianCoordinates="{msg.cartesian_coordinates}" />
                          {:else if key != "id" && key != "time_of_day" && key != "message_type" && key !== "class"}
                            {#if typeof msg[key] == "object"}
                              <GenericComponent i="{i}" j="{j}" genericObject="{msg[key]}" dataItemName="{key}" />
                            {:else}
                              <td></td>
                              <td></td>
                              <td>{key}</td>
                              <td>{msg[key]}</td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                            {/if}
                          {/if} 
                      </div>
                    {/each}

                     <table class="table table-striped table-bordered table-sm" cellspacing="0">
                      <thead>
                        <tr class="info">
                          <th></th>
                          <th></th>
                          <th>Item</th>
                          <th></th>
                          <th></th>
                          <th></th>
                          <th></th>
                          <th></th>
                        </tr>
                      </thead>

                      <tbody>
                        {#each Object.keys(msg) as key, j}
                          {#if key === "target_report_description" && msg.class === "Cat10"}
                            <TargetReportDescription
                              i="{i}"
                              j="{j}"
                              targetReportDescription="{msg.target_report_description}"
                            />
                          {:else if key === "cartesian_coordinates" && msg.class === "Cat10"}
                            <CartesianCoordinates i="{i}" j="{j}" cartesianCoordinates="{msg.cartesian_coordinates}" />
                          {:else if key != "id" && key != "time_of_day" && key != "message_type" && key !== "class"}
                            {#if typeof msg[key] == "object"}
                              <GenericComponent i="{i}" j="{j}" genericObject="{msg[key]}" dataItemName="{key}" />
                            {:else}
                              <td></td>
                              <td></td>
                              <td>{key}</td>
                              <td>{msg[key]}</td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                            {/if}
                          {/if}
                        {/each}
                      </tbody>
                    </table> 
                  </div>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr> -->
            {/each}
            <!-- <tr data-toggle="collapse" data-target="#demo2" class="accordion-toggle">
              <td><button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-eye-open"></span></button></td
                >
                <td>Silvio</td>
                <td>Santos</td>
                <td>São Paulo</td>
                <td>SP</td>
                <td> new</td>
              </tr>
              <tr>
                <td colspan="6" class="hiddenRow"><div id="demo2" class="accordian-body collapse">Demo2</div></td>
              </tr>
              <tr data-toggle="collapse" data-target="#demo3" class="accordion-toggle">
                <td><button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-eye-open"></span></button></td
                  >
                  <td>John</td>
                  <td>Doe</td>
                  <td>Dracena</td>
                  <td>SP</td>
                  <td> New</td>
            </tr>
            <tr>
              <td colspan="6" class="hiddenRow"
                ><div id="demo3" class="accordian-body collapse">Demo3 sadasdasdasdasdas</div></td
              >
            </tr> -->
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <!-- <div class="text-center">
    <nav aria-label="Page navigation example">
      <ul class="pagination">
        <li class="page-item" on:click="{() => handlePageClick(activePage - 1)}">
          <a class="page-link" href="#a">Previous</a>
        </li>
        {#each displayedPageArray as page}
          <li class="{activePage === page ? 'page-item active' : 'page-item'}" on:click="{() => handlePageClick(page)}">
            <a class="page-link" href="#a">{page}</a>
          </li>
        {/each}
        <li class="page-item" on:click="{() => handlePageClick(activePage + 1)}">
          <a class="page-link" href="#a">Next</a>
        </li>
      </ul>
    </nav>
  </div> -->
</div>
