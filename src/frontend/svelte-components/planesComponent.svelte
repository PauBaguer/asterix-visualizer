<script lang="ts">
  import { planeMap } from "../arcgis/graphicsLayer";
</script>

<div>
  {#each Array.from(planeMap.keys()) as key}
    <div>{key}</div>
  {/each}
</div>
