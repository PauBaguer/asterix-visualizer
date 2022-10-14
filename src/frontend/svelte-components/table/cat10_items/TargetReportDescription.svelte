<script lang="ts">
  import type { TargetReportDescription } from "../../../custom-types/asterix/cat10";

  export let i: number;
  export let j: number;
  export let targetReportDescription: TargetReportDescription;
  console.log(targetReportDescription);
</script>

<tr data-toggle="collapse" class="accordion-toggle" data-target="{`#demo${i}${j}`}">
  <td></td>
  <td><button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-eye-open"></span></button></td>
  <td>Target Report Description</td>
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
            <th>TYP</th>
            <th>DCR</th>
            <th>CHN</th>
            <th>GBS</th>
            <th>CRT</th>
            <th>SIM</th>
            <th>TST</th>
            <th>RAB</th>
            <th>LOP</th>
            <th>TOT</th>
            <th>SPI</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{targetReportDescription.TYP || ""}</td>
            <td>{targetReportDescription.DCR || ""}</td>
            <td>{targetReportDescription.CHN || ""}</td>
            <td>{targetReportDescription.GBS || ""}</td>
            <td>{targetReportDescription.CRT || ""}</td>
            <td>{targetReportDescription.SIM || ""}</td>
            <td>{targetReportDescription.TST || ""}</td>
            <td>{targetReportDescription.RAB || ""}</td>
            <td>{targetReportDescription.LOP || ""}</td>
            <td>{targetReportDescription.TOT || ""}</td>
            <td>{targetReportDescription.SPI || ""}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </td>
</tr>
