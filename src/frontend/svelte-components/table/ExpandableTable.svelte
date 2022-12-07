<style>
  #cont {
    padding-top: 10px;
  }
  #filters {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: center;
  }

  #search {
    padding-top: 5px;
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: center;
  }
</style>

<script lang="ts">
  import type { Cat10 } from "../../custom-types/asterix/cat10";
  import type { Cat21 } from "../../custom-types/asterix/cat21";
  import { ipcMainBidirectional } from "../../ipcMain/ipcMainCallers";
  import { parseIpcMainReceiveMessage } from "../../ipcMain/ipcMainReceiveParser";
  import GenericProps from "./cat10_items/GenericProps.svelte";

  interface Filter {
    Category: string[];
    Instrument: string[];
    Area: string[];
    MessageType: string[];
    TargetAddress?: string;
    TargetIdentification?: string;
    TrackNumber?: number;
  }

  const MSG_PER_PAGE = 15;
  //export let messages: (Cat10 | Cat21)[];
  let renderedMessges: (Cat10 | Cat21)[] = []; //messages.slice(0, MSG_PER_PAGE);
  let pageArray: number[] = [];
  let activePage = 1;
  let displayedPageArray: number[] = [];
  let allChildComponents = new Map<number, GenericProps>();
  let allChildComponentsKeys = Array.from(allChildComponents.keys());
  let btnchecksmr = false;
  let btncheckmlat = false;
  let btncheckadsb = false;
  let btncheck10 = false;
  let btncheck21 = false;
  let btnchecktr = false;
  let btncheckmlatsouc = false;
  let btncheckpsm = false;
  let btnchecketsm = false;
  let searchBox = "";
  let searchPicker = "Any";
  loadMessages();

  async function loadMessages() {
    clearSubcomponents();
    const filter: Filter = {
      Category: [],
      Instrument: [],
      Area: [],
      MessageType: [],
    };

    let search = searchBox;

    console.log(searchPicker);
    if (searchPicker !== "Any") {
      search = "";
      if (searchPicker === "Target Address") {
        filter.TargetAddress = searchBox;
      } else if (searchPicker === "Target identification") {
        filter.TargetIdentification = searchBox;
      } else if (searchPicker === "Track number") {
        filter.TrackNumber = parseInt(searchBox);
      }
    }

    if (btnchecksmr) filter.Instrument.push("SMR");
    if (btncheckmlat) filter.Instrument.push("MLAT");
    if (btncheckadsb) filter.Instrument.push("ADS-B");

    if (btncheck10) filter.Category.push("Cat10");
    if (btncheck21) filter.Category.push("Cat21");

    if (btncheckmlatsouc) filter.MessageType.push("Start of Update Cycle");
    if (btncheckpsm) filter.MessageType.push("Periodic Status Message");
    if (btnchecktr) filter.MessageType.push("Target Report");
    if (btnchecketsm) filter.MessageType.push("Event-triggered Status Message");
    const resp = await parseIpcMainReceiveMessage(
      await ipcMainBidirectional("table-protocol", { page: activePage, filter, search })
    );
    const parsedResp: { messages: (Cat10 | Cat21)[]; totalMessages: number } = resp;
    console.log({ resp });
    console.log({ parsedResp });
    renderedMessges = parsedResp.messages;
    const pageNumber = Math.round(parsedResp.totalMessages / MSG_PER_PAGE);
    pageArray = Array.from({ length: pageNumber }, (_, i) => i + 1);
    pageArray.slice(0, 7);
  }
  function handlePageClick(page: number) {
    clearSubcomponents();
    if (pageArray && pageArray.includes(page)) {
      activePage = page;
      if (activePage - 3 < 1) {
        displayedPageArray = pageArray.slice(0, 7);
      } else if (activePage + 3 > pageArray.length) {
        displayedPageArray = pageArray.slice(activePage - 5, pageArray.length);
      } else {
        displayedPageArray = pageArray.slice(activePage - 4, activePage + 3);
      }
      //renderedMessges = messages.slice((page - 1) * MSG_PER_PAGE, page * MSG_PER_PAGE);
      loadMessages();
    }
  }
  function clearSubcomponents() {
    allChildComponents.forEach((v, k) => {
      v.$destroy();
      allChildComponents.delete(k);
    });
    allChildComponentsKeys = Array.from(allChildComponents.keys());
  }

  function trClick(msg: Cat10 | Cat21) {
    let tr = document.getElementById(`tr-${msg.id}`);
    let tbody = document.querySelector("tbody");
    if (allChildComponents.has(msg.id)) {
      allChildComponents.get(msg.id)!.$destroy();
      allChildComponents.delete(msg.id);
      allChildComponentsKeys = Array.from(allChildComponents.keys());
    } else {
      // Open this row
      if (tbody && tr) {
        let arr = Array.from(tbody.children);
        let nexttr = arr[arr.indexOf(tr) + 1];
        let child = new GenericProps({ target: tbody, anchor: nexttr, props: { msg } });
        allChildComponents.set(msg.id, child);
        allChildComponentsKeys = Array.from(allChildComponents.keys());
      }
    }
  }

  function keyDown(e: any) {
    if (e.keyCode === 13) {
      updateFilters();
    }
  }

  function updateFilters() {
    setTimeout(() => {
      loadMessages();
    }, 100);
  }
</script>

<div class="container" id="cont">
  <div id="filters">
    <div class="btn-group" role="group" aria-label="Basic checkbox toggle button group">
      <input
        type="checkbox"
        bind:checked="{btnchecksmr}"
        on:change="{updateFilters}"
        class="btn-check"
        id="btnchecksmr"
        autocomplete="off"
      />
      <label class="btn btn-outline-primary" for="btnchecksmr">SMR</label>

      <input
        type="checkbox"
        bind:checked="{btncheckmlat}"
        on:change="{updateFilters}"
        class="btn-check"
        id="btncheckmlat"
        autocomplete="off"
      />
      <label class="btn btn-outline-primary" for="btncheckmlat">MLAT</label>

      <input
        type="checkbox"
        bind:checked="{btncheckadsb}"
        on:change="{updateFilters}"
        class="btn-check"
        id="btncheckadsb"
        autocomplete="off"
      />
      <label class="btn btn-outline-primary" for="btncheckadsb">ADSB</label>
    </div>
    <div class="btn-group" role="group" aria-label="Basic checkbox toggle button group">
      <input
        type="checkbox"
        bind:checked="{btncheck10}"
        on:change="{updateFilters}"
        class="btn-check"
        id="btncheck10"
        autocomplete="off"
      />
      <label class="btn btn-outline-primary" for="btncheck10">Cat10</label>

      <input
        type="checkbox"
        bind:checked="{btncheck21}"
        on:change="{updateFilters}"
        class="btn-check"
        id="btncheck21"
        autocomplete="off"
      />
      <label class="btn btn-outline-primary" for="btncheck21">Cat21</label>
    </div>
    <div class="btn-group" role="group" aria-label="Basic checkbox toggle button group">
      <input
        type="checkbox"
        bind:checked="{btnchecktr}"
        on:change="{updateFilters}"
        class="btn-check"
        id="btnchecktr"
        autocomplete="off"
      />
      <label class="btn btn-outline-primary" for="btnchecktr">Target Report</label>

      <input
        type="checkbox"
        bind:checked="{btncheckmlatsouc}"
        on:change="{updateFilters}"
        class="btn-check"
        id="btncheckmlatsouc"
        autocomplete="off"
      />
      <label class="btn btn-outline-primary" for="btncheckmlatsouc">Start of Update Cycle</label>

      <input
        type="checkbox"
        bind:checked="{btncheckpsm}"
        on:change="{updateFilters}"
        class="btn-check"
        id="btncheckpsm"
        autocomplete="off"
      />
      <label class="btn btn-outline-primary" for="btncheckpsm">Periodic Status Message</label>
      <input
        type="checkbox"
        bind:checked="{btnchecketsm}"
        on:change="{updateFilters}"
        class="btn-check"
        id="btnchecketsm"
        autocomplete="off"
      />
      <label class="btn btn-outline-primary" for="btnchecketsm">Event-triggered Status Message</label>
    </div>
  </div>
  <div id="search">
    <div class="input-group mb-3">
      <select
        style="max-width: 200px ;"
        class="form-select"
        id="inputGroup02"
        bind:value="{searchPicker}"
        aria-label="Example select with button addon"
      >
        <option selected>Any</option>
        <option>Target Address</option>
        <option>Target identification</option>
        <option>Track number</option>
      </select>
      <input
        bind:value="{searchBox}"
        type="text"
        class="form-control"
        on:keydown="{keyDown}"
        aria-label="Text input with dropdown button"
        placeholder="Search..."
      />
      <label class="input-group-text" on:click="{updateFilters}" for="inputGroup02">Search</label>
    </div>
  </div>
  {#if renderedMessges.length > 0}
    <div class="col-md-16">
      <div class="panel panel-default">
        <div class="panel-body">
          <table id="mainTable" class="table table-sm table-hover table-striped" cellspacing="0">
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
              {#each renderedMessges as msg}
                {#if msg.class === "Cat10"}
                  <tr on:click="{() => trClick(msg)}" id="tr-{msg.id}">
                    <td
                      ><button class="btn btn-default btn-xs">
                        {#if allChildComponentsKeys.includes(msg.id)}
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
                        {#if allChildComponentsKeys.includes(msg.id)}
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
    <div class="text-center">
      <nav aria-label="Page navigation example">
        <ul class="pagination">
          <li class="page-item" on:click="{() => handlePageClick(activePage - 1)}">
            <a class="page-link" href="#a">Previous</a>
          </li>

          {#if !displayedPageArray.includes(1)}
            <li class="page-item" on:click="{() => handlePageClick(1)}">
              <a class="page-link" href="#a">1</a>
            </li>
            <li class="page-item">
              <a class="page-link" href="#a">...</a>
            </li>
          {/if}

          {#each displayedPageArray as page}
            <li
              class="{activePage === page ? 'page-item active' : 'page-item'}"
              on:click="{() => handlePageClick(page)}"
            >
              <a class="page-link" href="#a">{page}</a>
            </li>
          {/each}

          {#if !displayedPageArray.includes(pageArray.length)}
            <li class="page-item">
              <a class="page-link" href="#a">...</a>
            </li>
            <li class="page-item" on:click="{() => handlePageClick(pageArray.length)}">
              <a class="page-link" href="#a">{pageArray.length}</a>
            </li>
          {/if}

          <li class="page-item" on:click="{() => handlePageClick(activePage + 1)}">
            <a class="page-link" href="#a">Next</a>
          </li>
        </ul>
      </nav>
    </div>
  {:else}
    <div class="d-flex justify-content-center">
      <span>No coincidences</span>
    </div>
  {/if}
</div>
