<style>
  #maindiv {
    overflow-y: auto;
    max-height: inherit;
    border-radius: 10px;
    width: 200px;
  }
  .card-body {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0.5rem;
  }

  #title {
    padding: 1rem 1rem;
  }
  #subtitle {
    padding-bottom: 1rem;
    font-size: small;
    padding-left: 1rem;
  }
</style>

<script lang="ts">
  import type { Cat21 } from "../custom-types/asterix/cat21";
  import { flyToPlane, selectPlane, unselectPlane } from "../arcgis/graphicsLayer";

  let planes: Cat21[] = [];
  let selectedPlane: string | null = null;

  const elem = document.querySelector("body")!;

  //@ts-ignore
  elem.addEventListener(
    "new-plane",
    (e: CustomEvent<Cat21>) => {
      /* … */

      const msg = e.detail as Cat21;
      planes.push(msg);
      planes = planes;
    },
    false
  );

  //@ts-ignore
  elem.addEventListener(
    "del-plane",
    (e: CustomEvent<Cat21>) => {
      /* … */

      const msg = e.detail as Cat21;
      if (msg.target_address === selectedPlane) selectedPlane = null;
      planes.splice(planes.indexOf(msg), 1);
      planes = planes;
    },
    false
  );

  //@ts-ignore
  elem.addEventListener(
    "clear-plane",
    () => {
      planes = [];
    },
    false
  );

  //@ts-ignore
  elem.addEventListener(
    "unsel",
    () => {
      selectedPlane = null;
    },
    false
  );

  function select(plane: Cat21) {
    if (selectedPlane === plane.target_address) {
      selectedPlane = null;
      unselectPlane();
      return;
    }
    selectedPlane = plane.target_address;
    selectPlane(plane.target_address);
  }
</script>

<div id="maindiv">
  {#if planes.length > 0}
    <div id="title">ADS-B Vehicles</div>
    <div id="subtitle">(click to select)</div>
    {#each planes as plane}
      {#if plane.target_identification}
        <div
          class="card"
          style="{selectedPlane ? (selectedPlane === plane.target_address ? 'background-color: #5083b8;' : '') : ''}"
        >
          <div class="card-body">
            <div
              on:click="{() => {
                select(plane);
              }}"
            >
              {plane.target_identification}
            </div>

            <div>
              <button
                on:click="{() => {
                  flyToPlane(plane.target_address);
                }}"
                type="button"
                class="btn btn-primary btn-sm"
              >
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </div>
        </div>
      {/if}
    {/each}
  {/if}
</div>
