<style>
  #maindiv {
    max-height: 500px;
    overflow-y: auto;
    border-radius: 10px;
    width: 200px;
  }
  .card-body {
    display: flex;
    justify-content: space-between;
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
</script>

<div id="maindiv">
  {#each planes as plane}
    {#if plane.target_identification}
      <div class="card">
        <div class="card-body">
          <div>
            {plane.target_identification}
          </div>
          <div>
            <button
              on:click="{() => {
                flyToPlane(plane.target_address);
              }}"
              type="button"
              class="btn btn-primary"
            >
              <i class="bi bi-eye"></i>
            </button>
          </div>
        </div>
      </div>
    {/if}
  {/each}
</div>
