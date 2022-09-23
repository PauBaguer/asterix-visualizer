<style>
  main {
    text-align: center;
    padding: 1em;

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
  #viewDiv {
    padding: 0;
    margin: 0;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
    width: 100%;
    height: 100%;
    overflow-y: hidden;
    overflow-x: hidden;
  }
</style>

<script lang="ts">
  import { initializeMap } from "./arcgis/map";
  initializeMap();

  function ipcMain(event: string) {
    window.electron.send(event);
  }
</script>

<main>
  <div class="ontop">
    <button on:click="{() => ipcMain('test')}">IPC MAIN test</button>
    <button on:click="{() => ipcMain('open-file-picker')}">Open file picker</button>
    <button on:click="{() => ipcMain('open-test-file')}">Open test file</button>
  </div>
  <div id="viewDiv"></div>
</main>
