<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

<script lang="ts">
  export let name: string;

  function ipcMain(event: string) {
    window.electron.send(event);
  }
</script>

<main>
  <h1>Hello {name}!</h1>
  <p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
  <button on:click="{() => ipcMain('test')}">IPC MAIN test</button>
  <button on:click="{() => ipcMain('open-file-picker')}">Open file picker</button>
  <button on:click="{() => ipcMain('open-test-file')}">Open test file</button>
</main>
