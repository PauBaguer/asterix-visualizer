<style>
  :global(.accordion-button) {
    padding: 0.5rem 1rem;
  }
</style>

<script lang="ts">
  export let obj: any;
  //  const unwanted = ["id", "message_type", "csv"];
  let objKeys = Object.keys(obj);
  objKeys = objKeys.sort();
  function typeoffkey(key: string) {
    let item: any = obj[key];

    return typeof item;
  }

  function getValue(key: string) {
    return obj[key];
  }

  function prettyKey(key: string) {
    let s = key.replaceAll("_", " ");
    s = s[0].toUpperCase() + s.slice(1);
    return s;
  }
</script>

<ul class="list-group">
  {#each objKeys as key}
    <!-- {#if !unwanted.includes(key)} -->
    <li class="list-group-item"><strong>{prettyKey(key)}:</strong> {getValue(key).toLocaleString()}</li>
    <!-- {/if} -->
  {/each}
</ul>
