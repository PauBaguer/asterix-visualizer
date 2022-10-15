<style>
  .hiddenRow {
    padding: 0 !important;
  }

  #cont {
    padding-top: 10px;
  }
</style>

<script>
  import CartesianCoordinates from "./cat10_items/CartesianCoordinates.svelte";
  import GenericComponent from "./cat10_items/GenericComponent.svelte";
  import TargetReportDescription from "./cat10_items/TargetReportDescription.svelte";

  export let messages;
  let renderedMessges = messages.slice(0, 20);
  const pageNumber = Math.round(messages.length / 20);
  const pageArray = Array.from({ length: pageNumber }, (_, i) => i + 1);
  let activePage = 1;

  function handlePageClick(page) {
    if (pageArray.includes(page)) {
      activePage = page;
      renderedMessges = messages.slice((page - 1) * 20, page * 20);
    }
  }

  console.log({ messages });
</script>

<div class="container" id="cont">
  <div class="col-md-16">
    <div class="panel panel-default">
      <div class="panel-heading text-center">Decode ASTERIX messages</div>
      <div class="panel-body">
        <table class="table table-condensed table-striped">
          <thead>
            <tr>
              <th></th>
              <th>Id</th>
              <th>Class</th>
              <th>Message Type</th>
              <th>Data source identifier</th>
              <th>Time of Day</th>
            </tr>
          </thead>
          <tbody>
            {#each renderedMessges as msg, i}
              <tr data-toggle="collapse" data-target="{`#demo${i}`}" class="accordion-toggle">
                <td
                  ><button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-eye-open"></span></button
                  ></td
                >
                {#if msg.class === "Cat10"}
                  <td>{msg.id}</td>
                  <td>{msg.class}</td>
                  <td>{msg.message_type}</td>
                  <td>{`${msg.data_source_identifier.SIC} ${msg.data_source_identifier.SAC}`}</td>
                  <td>{msg.time_of_day}</td>
                  <!-- {:else if msg.class === 21}
                  <td>{msg.id}</td>
                  <td>{msg.class}</td>
                  <td>{msg.service_identification}</td>
                  <td>{msg.data_source_identifier}</td>
                  <td>tbd</td> -->
                {/if}
              </tr>

              <tr>
                <td colspan="12" class="hiddenRow">
                  <div class="accordian-body collapse" id="{`demo${i}`}">
                    <table class="table table-striped">
                      <thead>
                        <tr class="info">
                          <th></th>
                          <th></th>
                          <th>Item</th>
                          <th></th>
                          <th></th>
                          <th></th>
                          <th></th>
                          <th></th>
                        </tr>
                      </thead>

                      <tbody>
                        {#each Object.keys(msg) as key, j}
                          {#if key === "target_report_description" && msg.class === "Cat10"}
                            <TargetReportDescription
                              i="{i}"
                              j="{j}"
                              targetReportDescription="{msg.target_report_description}"
                            />
                          {:else if key === "cartesian_coordinates" && msg.class === "Cat10"}
                            <CartesianCoordinates i="{i}" j="{j}" cartesianCoordinates="{msg.cartesian_coordinates}" />
                          {:else if msg.class === 10 && key != "id" && key != "time_of_day" && key != "message_type" && key !== "class"}
                            <GenericComponent i="{i}" j="{j}" genericObject="{msg[key]}" dataItemName="{key}" />
                          {/if}
                        {/each}
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            {/each}
            <!-- <tr data-toggle="collapse" data-target="#demo2" class="accordion-toggle">
              <td><button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-eye-open"></span></button></td
                >
                <td>Silvio</td>
                <td>Santos</td>
                <td>São Paulo</td>
                <td>SP</td>
                <td> new</td>
              </tr>
              <tr>
                <td colspan="6" class="hiddenRow"><div id="demo2" class="accordian-body collapse">Demo2</div></td>
              </tr>
              <tr data-toggle="collapse" data-target="#demo3" class="accordion-toggle">
                <td><button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-eye-open"></span></button></td
                  >
                  <td>John</td>
                  <td>Doe</td>
                  <td>Dracena</td>
                  <td>SP</td>
                  <td> New</td>
            </tr>
            <tr>
              <td colspan="6" class="hiddenRow"
                ><div id="demo3" class="accordian-body collapse">Demo3 sadasdasdasdasdas</div></td
              >
            </tr> -->
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div class="text-center">
    <nav aria-label="Page navigation example">
      <ul class="pagination">
        <li class="page-item" on:click="{() => handlePageClick(activePage - 1)}">
          <a class="page-link" href="#a">Previous</a>
        </li>
        {#each pageArray as page}
          <li class="{activePage === page ? 'page-item active' : 'page-item'}" on:click="{() => handlePageClick(page)}">
            <a class="page-link" href="#a">{page}</a>
          </li>
        {/each}
        <li class="page-item" on:click="{() => handlePageClick(activePage + 1)}">
          <a class="page-link" href="#a">Next</a>
        </li>
      </ul>
    </nav>
  </div>
</div>
