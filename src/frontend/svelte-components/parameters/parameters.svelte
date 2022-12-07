<style>
  #cont {
    padding-top: 10px;
  }
</style>

<script lang="ts">
  import type { ProbIdentification, AccuracyResults } from "../../custom-types/asterix/parameters_results";
  import { ipcMainBidirectional } from "../../ipcMain/ipcMainCallers";
  import { parseIpcMainReceiveMessage } from "../../ipcMain/ipcMainReceiveParser";

  loadData();
  async function loadData() {
    const resp = await parseIpcMainReceiveMessage(await ipcMainBidirectional("parameters-results"));
    const parsedResp: { probIden: ProbIdentification; accuracy_res: AccuracyResults } = resp;
    console.log({ resp });
    console.log({ parsedResp });
  }
</script>

<div class="container" id="cont">
  <p>Hello Julia</p>
  <!-- {#if renderedMessges.length > 0}
    <div class="d-flex justify-content-center"></div>
  {:else}
    <div class="d-flex justify-content-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  {/if} -->
</div>
