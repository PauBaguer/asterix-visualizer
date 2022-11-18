<script lang="ts">
  import type { TargetReportDescription } from "../../../custom-types/asterix/cat10";

  export let i: number;
  export let j: number;
  export let genericObject: any;
  export let dataItemName: string;
  console.log(genericObject);
</script>

<tr data-toggle="collapse" class="accordion-toggle" data-target="{`#demo${i}${j}`}">
  <td></td>
  <td><button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-eye-open"></span></button></td>
  <td>{dataItemName}</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td colspan="12" class="hiddenRow">
    <div class="accordian-body" id="{`demo${i}${j}`}">
      <table class="table table-striped table-bordered table-sm" cellspacing="0">
        <thead>
          <tr>
            {#each Object.keys(genericObject) as key}
              {#if genericObject[key]}
                <th>{key}</th>
              {/if}
            {/each}
          </tr>
        </thead>
        <tbody>
          <tr>
            {#each Object.keys(genericObject) as key}
              {#if genericObject[key]}
                <td>{genericObject[key]}</td>
              {/if}
            {/each}
          </tr>
        </tbody>
      </table>
    </div>
  </td>
</tr>
