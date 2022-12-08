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
  let showInfo1 = false;
  let showInfo2 = false;

  loadData();
  async function loadData() {
    const resp = await parseIpcMainReceiveMessage(await ipcMainBidirectional("parameters-results"));

    const results: { id: ProbIdentification; accuracy_parameters: AccuracyResults } = resp;

    accuracy = results.accuracy_parameters;
    probId = results.id;
    falseManeouvering = probId.RWY24L.False + probId.RWY24R.False + probId.RWY02.False + probId.Taxi.False;
    totalManeouvering = probId.RWY24L.Total + probId.RWY24R.Total + probId.RWY02.Total + probId.Taxi.Total;
    falseApron = probId.ApronT1.False + probId.ApronT2.False;
    totalApron = probId.ApronT1.Total + probId.ApronT2.Total;
    falseStand = probId.StandT1.False + probId.StandT2.False;
    totalStand = probId.StandT1.Total + probId.StandT2.Total;
    falseAirbone = probId.Airbone2.False + probId.Airbone5.False + probId.Airbone10.False;
    totalAirbone = probId.Airbone2.Total + probId.Airbone5.Total + probId.Airbone10.Total;
    total = totalAirbone + totalApron + totalManeouvering + totalStand;
    false_total = falseAirbone + falseApron + falseManeouvering + falseStand;
  }
  export function showInfo1Click() {
    showInfo1 = !showInfo1;
  }
  export function showInfo2Click() {
    showInfo2 = !showInfo2;
  }
</script>

<div class="container" id="cont">
  {#if total !== 0}
    <br /> <br />
    <h4>Probability of False Identification</h4>
    <p><i class="bi bi-info-circle" on:click="{showInfo1Click}"></i></p>

    {#if showInfo1}
      <div class="card card-body">
        Percentage of times the target identifier has changed of value in each string during a 5s window, this
        probability must be less than 0.0001% regardless of the area where the aircraft is located.
      </div>
    {/if}
    <div class="col-md-16">
      <div class="panel panel-default">
        <div class="panel-body">
          <table id="mainTable" class="table table-sm table-hover" cellspacing="0">
            <thead>
              <tr>
                <th></th>
                <th>Total</th>
                <th>False</th>
                <th>Prob. False ID</th>
              </tr>
            </thead>
            <tbody>
              <tr class="table-secondary">
                <td><b>Maneouvering Area</b></td>
                <td>{totalManeouvering}</td>
                <td>{falseManeouvering}</td>
                <td>{Math.round((falseManeouvering / totalManeouvering) * 1000000) / 10000}</td>
              </tr>
              <tr>
                <td> &nbsp;&nbsp;&nbsp;&nbsp; RWY 24L</td>
                <td>{probId.RWY24L.Total}</td>
                <td>{probId.RWY24L.False}</td>
                <td>{Math.round((probId.RWY24L.False / probId.RWY24L.Total) * 1000000) / 10000}</td>
              </tr>
              <tr>
                <td> &nbsp;&nbsp;&nbsp;&nbsp; RWY 24R</td>
                <td>{probId.RWY24R.Total}</td>
                <td>{probId.RWY24R.False}</td>
                <td>{Math.round((probId.RWY24R.False / probId.RWY24R.Total) * 1000000) / 10000}</td>
              </tr>
              <tr>
                <td> &nbsp;&nbsp;&nbsp;&nbsp; RWY 02</td>
                <td>{probId.RWY02.Total}</td>
                <td>{probId.RWY02.False}</td>
                <td>{Math.round((probId.RWY02.False / probId.RWY02.Total) * 1000000) / 10000}</td>
              </tr>
              <tr>
                <td> &nbsp;&nbsp;&nbsp;&nbsp; Taxi</td>
                <td>{probId.Taxi.Total}</td>
                <td>{probId.Taxi.False}</td>
                <td>{Math.round((probId.Taxi.False / probId.Taxi.Total) * 1000000) / 10000}</td>
              </tr>
              <tr class="table-secondary">
                <td><b>Apron</b></td>
                <td>{totalApron}</td>
                <td>{falseApron}</td>
                <td>{Math.round((falseApron / totalApron) * 1000000) / 10000}</td>
              </tr>
              <tr>
                <td> &nbsp;&nbsp;&nbsp;&nbsp; Apron T1</td>
                <td>{probId.ApronT1.Total}</td>
                <td>{probId.ApronT1.False}</td>
                <td>{Math.round((probId.ApronT1.False / probId.ApronT1.Total) * 1000000) / 10000}</td>
              </tr>
              <tr>
                <td> &nbsp;&nbsp;&nbsp;&nbsp; Apron T2</td>
                <td>{probId.ApronT2.Total}</td>
                <td>{probId.ApronT2.False}</td>
                <td>{Math.round((probId.ApronT2.False / probId.ApronT2.Total) * 1000000) / 10000}</td>
              </tr>
              <tr class="table-secondary">
                <td><b>Stands</b></td>
                <td>{totalStand}</td>
                <td>{falseStand}</td>
                <td>{Math.round((falseStand / totalStand) * 1000000) / 10000}</td>
              </tr>
              <tr>
                <td> &nbsp;&nbsp;&nbsp;&nbsp; Stands T1</td>
                <td>{probId.StandT1.Total}</td>
                <td>{probId.StandT1.False}</td>
                <td>{Math.round((probId.StandT1.False / probId.StandT1.Total) * 1000000) / 10000}</td>
              </tr>
              <tr>
                <td> &nbsp;&nbsp;&nbsp;&nbsp; Stands T2</td>
                <td>{probId.StandT2.Total}</td>
                <td>{probId.StandT2.False}</td>
                <td>{Math.round((probId.StandT2.False / probId.StandT2.Total) * 1000000) / 10000}</td>
              </tr>
              <tr class="table-secondary">
                <td><b>Airbone</b></td>
                <td>{totalAirbone}</td>
                <td>{falseAirbone}</td>
                <td>{Math.round((falseAirbone / totalAirbone) * 1000000) / 10000}</td>
              </tr>
              <tr>
                <td> &nbsp;&nbsp;&nbsp;&nbsp; Type 4</td>
                <td>{probId.Airbone2.Total}</td>
                <td>{probId.Airbone2.False}</td>
                <td>{Math.round((probId.Airbone2.False / probId.Airbone2.Total) * 1000000) / 10000}</td>
              </tr>
              <tr>
                <td> &nbsp;&nbsp;&nbsp;&nbsp; Type 5</td>
                <td>{probId.Airbone5.Total}</td>
                <td>{probId.Airbone5.False}</td>
                <td>{Math.round((probId.Airbone5.False / probId.Airbone5.Total) * 1000000) / 10000}</td>
              </tr>
              <tr>
                <td> &nbsp;&nbsp;&nbsp;&nbsp; Rest</td>
                <td>{probId.Airbone10.Total}</td>
                <td>{probId.Airbone10.False}</td>
                <td>{Math.round((probId.Airbone10.False / probId.Airbone10.Total) * 1000000) / 10000}</td>
              </tr>
              <tr class="table-secondary">
                <td><b>TOTAL</b></td>
                <td><b>{total}</b></td>
                <td><b>{false_total}</b></td>
                <td><b>{Math.round((false_total / total) * 1000000) / 10000}</b></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <br /> <br />
    {#if accuracy.Maneouvering_95max + accuracy.Apron_95max + accuracy.Stand_max !== 0}
      <h4>Position Accuracy</h4>
      <p><i class="bi bi-info-circle" on:click="{showInfo2Click}"></i></p>
      {#if showInfo2}
        <div class="card card-body">
          In document ED-117, it states that the maximum error between the received horizontal position of a target and
          its real position must be based on the area in which the aircraft is located:
          <br /> &nbsp;&nbsp;- Maneuvering area and Apron: Maximum error of 7.5 m 95% of the time. And a maximum error
          of 12 m 99% of the time.
          <br /> &nbsp;&nbsp;- Stand: Maximum error of 20 m averaged in periods of 5 seconds.
          <br /> &nbsp;&nbsp;- Type 4 area: Maximum error of 20 m 95% of the time.
          <br /> &nbsp;&nbsp;- Type 5 area: Maximum error of 40 m 95% of the time.
          <br />The real position has been considered as the one received by the ADS-B system with a Position Integrity
          Category &lt; 0.3 NM, within a window of 50 ms.
        </div>
      {/if}
      <div class="col-md-16">
        <div class="panel panel-default">
          <div class="panel-body">
            <table id="mainTable" class="table table-sm table-hover" cellspacing="0">
              <thead>
                <tr>
                  <th></th>
                  <th>P95</th>
                  <th>P99</th>
                  <th>Max</th>
                  <th>Mean</th>
                  <th>STD</th>
                </tr>
              </thead>
              <tbody>
                <tr class="table-secondary">
                  <td><b>Maneouvering Area</b></td>
                  <td>{Math.round(accuracy.Maneouvering_95max * 100) / 100}</td>
                  <td>{Math.round(accuracy.Maneouvering_99max * 100) / 100}</td>
                  <td></td>
                  <td>{Math.round(accuracy.Maneouvering_average * 100) / 100}</td>
                  <td>{Math.round(accuracy.Maneouvering_std * 100) / 100}</td>
                </tr>
                <tr>
                  <td> &nbsp;&nbsp;&nbsp;&nbsp; RWY 24L</td>
                  <td>{Math.round(accuracy.RWY24L_95max * 100) / 100}</td>
                  <td>{Math.round(accuracy.RWY24L_99max * 100) / 100}</td>
                  <td></td>
                  <td>{Math.round(accuracy.RWY24L_average * 100) / 100}</td>
                  <td>{Math.round(accuracy.RWY24L_std * 100) / 100}</td>
                </tr>
                <tr>
                  <td> &nbsp;&nbsp;&nbsp;&nbsp; RWY 24R</td>
                  <td>{Math.round(accuracy.RWY24R_95max * 100) / 100}</td>
                  <td>{Math.round(accuracy.RWY24R_99max * 100) / 100}</td>
                  <td></td>
                  <td>{Math.round(accuracy.RWY24R_average * 100) / 100}</td>
                  <td>{Math.round(accuracy.RWY24R_std * 100) / 100}</td>
                </tr>
                <tr>
                  <td> &nbsp;&nbsp;&nbsp;&nbsp; RWY 02</td>
                  <td>{Math.round(accuracy.RWY2_95max * 100) / 100}</td>
                  <td>{Math.round(accuracy.RWY2_99max * 100) / 100}</td>
                  <td></td>
                  <td>{Math.round(accuracy.RWY2_average * 100) / 100}</td>
                  <td>{Math.round(accuracy.RWY2_std * 100) / 100}</td>
                </tr>
                <tr>
                  <td> &nbsp;&nbsp;&nbsp;&nbsp; Taxi</td>
                  <td>{Math.round(accuracy.Taxi_95max * 100) / 100}</td>
                  <td>{Math.round(accuracy.Taxi_99max * 100) / 100}</td>
                  <td></td>
                  <td>{Math.round(accuracy.Taxi_average * 100) / 100}</td>
                  <td>{Math.round(accuracy.Taxi_std * 100) / 100}</td>
                </tr>
                <tr class="table-secondary">
                  <td><b>Apron</b></td>
                  <td>{Math.round(accuracy.Apron_95max * 100) / 100}</td>
                  <td>{Math.round(accuracy.Apron_99max * 100) / 100}</td>
                  <td></td>
                  <td>{Math.round(accuracy.Apron_average * 100) / 100}</td>
                  <td>{Math.round(accuracy.Apron_std * 100) / 100}</td>
                </tr>
                <tr>
                  <td> &nbsp;&nbsp;&nbsp;&nbsp; Apron T1</td>
                  <td>{Math.round(accuracy.ApronT1_95max * 100) / 100}</td>
                  <td>{Math.round(accuracy.ApronT1_99max * 100) / 100}</td>
                  <td></td>
                  <td>{Math.round(accuracy.ApronT1_average * 100) / 100}</td>
                  <td>{Math.round(accuracy.ApronT1_std * 100) / 100}</td>
                </tr>
                <tr>
                  <td> &nbsp;&nbsp;&nbsp;&nbsp; Apron T2</td>
                  <td>{Math.round(accuracy.ApronT2_95max * 100) / 100}</td>
                  <td>{Math.round(accuracy.ApronT2_99max * 100) / 100}</td>
                  <td></td>
                  <td>{Math.round(accuracy.ApronT2_average * 100) / 100}</td>
                  <td>{Math.round(accuracy.ApronT2_std * 100) / 100}</td>
                </tr>
                <tr class="table-secondary">
                  <td><b>Stands</b></td>
                  <td></td>
                  <td></td>
                  <td>{Math.round(accuracy.Stand_max * 100) / 100}</td>
                  <td>{Math.round(accuracy.Stand_average * 100) / 100}</td>
                  <td>{Math.round(accuracy.Stand_std * 100) / 100}</td>
                </tr>
                <tr>
                  <td> &nbsp;&nbsp;&nbsp;&nbsp; Stands T1</td>
                  <td></td>
                  <td></td>
                  <td>{Math.round(accuracy.StandT1_max * 100) / 100}</td>
                  <td>{Math.round(accuracy.StandT1_average * 100) / 100}</td>
                  <td>{Math.round(accuracy.StandT1_std * 100) / 100}</td>
                </tr>
                <tr>
                  <td> &nbsp;&nbsp;&nbsp;&nbsp; Stands T2</td>
                  <td></td>
                  <td></td>
                  <td>{Math.round(accuracy.StandT2_max * 100) / 100}</td>
                  <td>{Math.round(accuracy.StandT2_average * 100) / 100}</td>
                  <td>{Math.round(accuracy.StandT2_std * 100) / 100}</td>
                </tr>
                <tr class="table-secondary">
                  <td><b>Airbone</b></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td> &nbsp;&nbsp;&nbsp;&nbsp; Type 4</td>
                  <td>{Math.round(accuracy.Airbone2_95max * 100) / 100}</td>
                  <td></td>
                  <td></td>
                  <td>{Math.round(accuracy.Airbone2_average * 100) / 100}</td>
                  <td>{Math.round(accuracy.Airbone2_std * 100) / 100}</td>
                </tr>
                <tr>
                  <td> &nbsp;&nbsp;&nbsp;&nbsp; Type 5</td>
                  <td>{Math.round(accuracy.Airbone5_95max * 100) / 100}</td>
                  <td></td>
                  <td></td>
                  <td>{Math.round(accuracy.Airbone5_average * 100) / 100}</td>
                  <td>{Math.round(accuracy.Airbone5_std * 100) / 100}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <br /> <br />
    {:else}
      <div class="d-flex justify-content-center">
        <br /> <br />
        <p>No ADS-B messages found, unable to compute accuracy</p>
      </div>
    {/if}
  {:else}
    <div class="d-flex justify-content-center">
      <br /> <br />
      <p>No MLAT messages found</p>
    </div>
  {/if}
</div>
