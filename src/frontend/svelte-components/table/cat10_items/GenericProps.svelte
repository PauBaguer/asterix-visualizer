<style>
  :global(.accordion-button) {
    padding: 0.5rem 1rem;
  }
</style>

<script lang="ts">
  import type { Cat10 } from "../../../custom-types/asterix/cat10";
  import type { Cat21 } from "../../../custom-types/asterix/cat21";
  import GenericObject from "./GenericObject.svelte";

  export let msg: Cat10 | Cat21;
  const unwanted = ["id", "message_type", "csv"];
  let msgKeys = Object.keys(msg);
  let msgKeysObj = msgKeys.filter((key) => typeoffkey(key) === "object");
  let msgKeysNotObj = msgKeys.filter((key) => typeoffkey(key) !== "object");
  msgKeysObj = msgKeysObj.sort();
  msgKeysNotObj = msgKeysNotObj.sort();

  function typeoffkey(key: string) {
    let item: any = msg[key as keyof (Cat10 | Cat21)];

    return typeof item;
  }

  function getValue(key: string) {
    return msg[key as keyof (Cat10 | Cat21)];
  }

  function prettyKey(key: string) {
    let s = key.replaceAll("_", " ");
    s = s[0].toUpperCase() + s.slice(1);
    return s;
  }
</script>

<tr colspan="7">
  <td colspan="7">
    <ul class="list-group">
      {#each msgKeysNotObj as key}
        {#if !unwanted.includes(key)}
          <li class="list-group-item"><strong>{prettyKey(key)}:</strong> {getValue(key).toLocaleString()}</li>
        {/if}
      {/each}
    </ul>
    <div class="accordion" id="accordion-{msg.id}">
      {#each msgKeysObj as key}
        {#if !unwanted.includes(key)}
          <div class="accordion-item">
            <h2 class="accordion-header" id="heading-{msg.id}-{key}">
              <button
                class="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapse-{msg.id}-{key}"
                aria-expanded="true"
                aria-controls="collapse-{msg.id}-{key}"
              >
                <strong>{prettyKey(key)}</strong>
              </button>
            </h2>
            <div
              id="collapse-{msg.id}-{key}"
              class="accordion-collapse collapse"
              aria-labelledby="heading-{msg.id}-{key}"
              data-bs-parent="#accordion-{msg.id}"
            >
              <div class="accordion-body"><GenericObject obj="{getValue(key)}" /></div>
            </div>
          </div>
        {/if}
      {/each}
    </div>
  </td>
</tr>
