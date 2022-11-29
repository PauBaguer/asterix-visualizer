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
</style>

<script lang="ts">
  import type { Cat21 } from "../custom-types/asterix/cat21";
  import { flyToPlane } from "../arcgis/graphicsLayer";

  let planes: Cat21[] = [];

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
</script>

<div id="maindiv">
  {#if planes.length > 0}
    <div id="title">ADS-B Vehicles</div>
    {#each planes as plane}
      {#if plane.target_identification}
        <div class="card">
          <div class="card-body">
            {plane.target_identification}

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
