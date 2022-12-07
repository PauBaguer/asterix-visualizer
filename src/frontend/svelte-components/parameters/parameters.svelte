<style>
  #cont {
    padding-top: 10px;
  }
</style>

<script lang="ts">
  import type { ProbIdentification, AccuracyResults } from "../../custom-types/asterix/parameters_results";
  import { ipcMainBidirectional } from "../../ipcMain/ipcMainCallers";
  import { parseIpcMainReceiveMessage } from "../../ipcMain/ipcMainReceiveParser";
  let accuracy: AccuracyResults;
  let probId: ProbIdentification;
  let totalManeouvering = 0;
  let falseManeouvering = 0;
  let totalApron = 0;
  let falseApron = 0;
  let totalStand = 0;
  let falseStand = 0;
  let totalAirbone = 0;
  let falseAirbone = 0;
  let total = 0;
  let false_total = 0;

  loadData();
  async function loadData() {
    const resp = await parseIpcMainReceiveMessage(await ipcMainBidirectional("parameters-results"));
    console.log(resp);
    const results: { id: ProbIdentification; accuracy_parameters: AccuracyResults } = resp;
    console.log({ resp });
    console.log({ results });
    accuracy = results.accuracy_parameters;
    probId = results.id;
    falseManeouvering = probId.RWY24L.False + probId.RWY24R.False + probId.RWY02.False + probId.Taxi.False;
    totalManeouvering =
      probId.RWY24L.Correct + probId.RWY24R.Correct + probId.RWY02.Correct + probId.Taxi.Correct + falseManeouvering;
    falseApron = probId.ApronT1.False + probId.ApronT2.False;
    totalApron = probId.ApronT1.Correct + probId.ApronT2.Correct + falseApron;
    falseStand = probId.StandT1.False + probId.StandT2.False;
    totalStand = probId.StandT1.Correct + probId.StandT2.Correct + falseStand;
    falseAirbone = probId.Airbone2.False + probId.Airbone5.False + probId.Airbone10.False;
    totalAirbone = probId.Airbone2.Correct + probId.Airbone5.Correct + probId.Airbone10.Correct + falseAirbone;
    total = totalAirbone + totalApron + totalManeouvering + totalStand;
    false_total = falseAirbone + falseApron + falseManeouvering + falseStand;
  }
</script>

<div class="container" id="cont">
  {#if total !== 0}
    <div></div>
    <h4>Probability of False Identification</h4>
    <div class="col-md-16">
      <div class="panel panel-default">
        <div class="panel-body">
          <table id="mainTable" class="table table-sm table-hover table-striped" cellspacing="0">
            <thead>
              <tr>
                <th></th>
                <th>Total</th>
                <th>False</th>
                <th>Prob. False ID</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Maneouvering Area</b></td>
                <td>{totalManeouvering}</td>
                <td>{falseManeouvering}</td>
                <td>{Math.round((falseManeouvering / totalManeouvering) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td> - RWY 24L</td>
                <td>{probId.RWY24L.Correct + probId.RWY24L.False}</td>
                <td>{probId.RWY24L.False}</td>
                <td>{Math.round((probId.RWY24L.False / probId.RWY24L.Correct) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td> - RWY 24R</td>
                <td>{probId.RWY24R.Correct + probId.RWY24R.False}</td>
                <td>{probId.RWY24R.False}</td>
                <td>{Math.round((probId.RWY24R.False / probId.RWY24R.Correct) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td> - RWY 02</td>
                <td>{probId.RWY02.Correct + probId.RWY02.False}</td>
                <td>{probId.RWY02.False}</td>
                <td>{Math.round((probId.RWY02.False / probId.RWY02.Correct) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td> - Taxi</td>
                <td>{probId.Taxi.Correct + probId.Taxi.False}</td>
                <td>{probId.Taxi.False}</td>
                <td>{Math.round((probId.Taxi.False / probId.Taxi.Correct) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td><b>Apron</b></td>
                <td>{totalApron}</td>
                <td>{falseApron}</td>
                <td>{Math.round((falseApron / totalApron) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td> - Apron T1</td>
                <td>{probId.ApronT1.Correct + probId.ApronT1.False}</td>
                <td>{probId.ApronT1.False}</td>
                <td>{Math.round((probId.ApronT1.False / probId.ApronT1.Correct) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td> - Apron T2</td>
                <td>{probId.ApronT2.Correct + probId.ApronT2.False}</td>
                <td>{probId.ApronT2.False}</td>
                <td>{Math.round((probId.ApronT2.False / probId.ApronT2.Correct) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td><b>Stands</b></td>
                <td>{totalStand}</td>
                <td>{falseStand}</td>
                <td>{Math.round((falseStand / totalStand) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td> - Stands T1</td>
                <td>{probId.StandT1.Correct + probId.StandT1.False}</td>
                <td>{probId.StandT1.False}</td>
                <td>{Math.round((probId.StandT1.False / probId.StandT1.Correct) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td> - Stands T2</td>
                <td>{probId.StandT2.Correct + probId.StandT2.False}</td>
                <td>{probId.StandT2.False}</td>
                <td>{Math.round((probId.StandT2.False / probId.StandT2.Correct) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td><b>Airbone</b></td>
                <td>{totalAirbone}</td>
                <td>{falseAirbone}</td>
                <td>{Math.round((falseAirbone / totalAirbone) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td> - Type 4</td>
                <td>{probId.Airbone2.Correct + probId.Airbone2.False}</td>
                <td>{probId.Airbone2.False}</td>
                <td>{Math.round((probId.Airbone2.False / probId.Airbone2.Correct) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td> - Type 5</td>
                <td>{probId.Airbone5.Correct + probId.Airbone5.False}</td>
                <td>{probId.Airbone5.False}</td>
                <td>{Math.round((probId.Airbone5.False / probId.Airbone5.Correct) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td> - Rest</td>
                <td>{probId.Airbone10.Correct + probId.Airbone10.False}</td>
                <td>{probId.Airbone10.False}</td>
                <td>{Math.round((probId.Airbone10.False / probId.Airbone10.Correct) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td><b>TOTAL</b></td>
                <td><b>{total}</b></td>
                <td><b>{false_total}</b></td>
                <td><b>{Math.round((false_total / total) * 100000) / 1000}</b></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div></div>
    <h4>Position Accuracy</h4>
    <div class="col-md-16">
      <div class="panel panel-default">
        <div class="panel-body">
          <table id="mainTable" class="table table-sm table-hover table-striped" cellspacing="0">
            <thead>
              <tr>
                <th></th>
                <th>P95</th>
                <th>P99</th>
                <th>Mean</th>
                <th>STD</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Maneouvering Area</b></td>
                <td>{accuracy.Maneouvering_95max}</td>
                <td>{accuracy.Maneouvering_99max}</td>
                <td>{accuracy.Maneouvering_average}</td>
                <td>{accuracy.Maneouvering_std}</td>
              </tr>
              <tr>
                <td> - RWY 24L</td>
                <td>{accuracy.RWY24L_95max}</td>
                <td>{accuracy.RWY24L_99max}</td>
                <td>{accuracy.RWY24L_average}</td>
                <td>{accuracy.RWY24L_std}</td>
              </tr>
              <tr>
                <td> - RWY 24R</td>
                <td>{accuracy.RWY24R_95max}</td>
                <td>{accuracy.RWY24R_99max}</td>
                <td>{accuracy.RWY24R_average}</td>
                <td>{accuracy.RWY24R_std}</td>
              </tr>
              <tr>
                <td> - RWY 02</td>
                <td>{accuracy.RWY2_95max}</td>
                <td>{accuracy.RWY2_99max}</td>
                <td>{accuracy.RWY2_average}</td>
                <td>{accuracy.RWY2_std}</td>
              </tr>
              <tr>
                <td> - Taxi</td>
                <td>{accuracy.Taxi_95max}</td>
                <td>{accuracy.Taxi_99max}</td>
                <td>{accuracy.Taxi_average}</td>
                <td>{accuracy.Taxi_std}</td>
              </tr>
              <tr>
                <td><b>Apron</b></td>
                <td>{accuracy.Apron_95max}</td>
                <td>{accuracy.Apron_99max}</td>
                <td>{accuracy.Apron_average}</td>
                <td>{accuracy.Apron_std}</td>
              </tr>
              <tr>
                <td> - Apron T1</td>
                <td>{accuracy.ApronT1_95max}</td>
                <td>{accuracy.ApronT1_99max}</td>
                <td>{accuracy.ApronT1_average}</td>
                <td>{accuracy.ApronT1_std}</td>
              </tr>
              <tr>
                <td> - Apron T2</td>
                <td>{accuracy.ApronT2_95max}</td>
                <td>{accuracy.ApronT2_99max}</td>
                <td>{accuracy.ApronT2_average}</td>
                <td>{accuracy.ApronT2_std}</td>
              </tr>
              <tr>
                <td><b>Stands</b></td>
                <td>{accuracy.Stand_max}</td>
                <td></td>
                <td>{accuracy.Stand_average}</td>
                <td>{accuracy.Stand_std}</td>
              </tr>
              <tr>
                <td> - Stands T1</td>
                <td>{probId.StandT1.Correct + probId.StandT1.False}</td>
                <td>{probId.StandT1.False}</td>
                <td>{Math.round((probId.StandT1.False / probId.StandT1.Correct) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td> - Stands T2</td>
                <td>{probId.StandT2.Correct + probId.StandT2.False}</td>
                <td>{probId.StandT2.False}</td>
                <td>{Math.round((probId.StandT2.False / probId.StandT2.Correct) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td><b>Airbone</b></td>
                <td>{totalAirbone}</td>
                <td>{falseAirbone}</td>
                <td>{Math.round((falseAirbone / totalAirbone) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td> - Type 4</td>
                <td>{probId.Airbone2.Correct + probId.Airbone2.False}</td>
                <td>{probId.Airbone2.False}</td>
                <td>{Math.round((probId.Airbone2.False / probId.Airbone2.Correct) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td> - Type 5</td>
                <td>{probId.Airbone5.Correct + probId.Airbone5.False}</td>
                <td>{probId.Airbone5.False}</td>
                <td>{Math.round((probId.Airbone5.False / probId.Airbone5.Correct) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td> - Rest</td>
                <td>{probId.Airbone10.Correct + probId.Airbone10.False}</td>
                <td>{probId.Airbone10.False}</td>
                <td>{Math.round((probId.Airbone10.False / probId.Airbone10.Correct) * 100000) / 1000}</td>
              </tr>
              <tr>
                <td><b>TOTAL</b></td>
                <td><b>{total}</b></td>
                <td><b>{false_total}</b></td>
                <td><b>{Math.round((false_total / total) * 100000) / 1000}</b></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  {:else}
    <div class="d-flex justify-content-center">
      <p>No MLAT messages found</p>
    </div>
  {/if}
</div>
