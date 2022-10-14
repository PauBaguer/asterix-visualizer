<script lang="ts">
  import type { CartesianCoordinates } from "../../../custom-types/asterix/cat10";

  export let i: number;
  export let j: number;
  export let cartesianCoordinates: CartesianCoordinates;
  console.log(cartesianCoordinates);
</script>

<tr data-toggle="collapse" class="accordion-toggle" data-target="{`#demo${i}${j}`}">
  <td></td>
  <td><button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-eye-open"></span></button></td>
  <td>Cartesian Coordinates</td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td colspan="12" class="hiddenRow">
    <div class="accordian-body collapse" id="{`demo${i}${j}`}">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>X</th>
            <th>Y</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{cartesianCoordinates.x || ""}</td>
            <td>{cartesianCoordinates.y || ""}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </td>
</tr>
