<style>
  .hiddenRow {
    padding: 0 !important;
  }

  #cont {
    padding-top: 10px;
  }
</style>

<script lang="ts">
  import type { Cat10 } from "../custom-types/asterix/cat10";
  import type { Cat21 } from "../custom-types/asterix/cat21";

  export let messages: (Cat10 | Cat21)[];
  let renderedMessges = messages.slice(0, 20);
  const pageNumber = Math.round(messages.length / 20);
  const pageArray = Array.from({ length: pageNumber }, (_, i) => i + 1);
  let activePage = 1;

  function handlePageClick(page: number) {
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
              <th>Class</th>
              <th>Id</th>
              <th>Message Type</th>
              <th>Src Id</th>
              <th>Time of Day</th>
            </tr>
          </thead>
          <tbody>
            {#each renderedMessges as msg}
              <tr data-toggle="collapse" data-target="#demo1" class="accordion-toggle">
                <td
                  ><button class="btn btn-default btn-xs"><span class="glyphicon glyphicon-eye-open"></span></button
                  ></td
                >
                {#if msg.class === 10}
                  <td>{msg.class}</td>
                  <td>{msg.id}</td>
                  <td>{msg.message_type}</td>
                  <td>{`${msg.data_source_identifier.SIC} ${msg.data_source_identifier.SAC}`}</td>
                  <td>{msg.time_of_day}</td>
                {:else if msg.class === 21}
                  <td>{msg.class}</td>
                  <td>{msg.id}</td>
                  <td>{msg.service_identification}</td>
                  <td>{msg.data_source_identifier}</td>
                  <td>tbd</td>
                {/if}
              </tr>

              <tr>
                <td colspan="12" class="hiddenRow">
                  <div class="accordian-body collapse" id="demo1">
                    <table class="table table-striped">
                      <thead>
                        <tr class="info">
                          <th>Job</th>
                          <th>Company</th>
                          <th>Salary</th>
                          <th>Date On</th>
                          <th>Date off</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr data-toggle="collapse" class="accordion-toggle" data-target="#demo10">
                          <td> <a href="#a">Enginner Software</a></td>
                          <td>Google</td>
                          <td>U$8.00000 </td>
                          <td> 2016/09/27</td>
                          <td> 2017/09/27</td>
                          <td>
                            <a href="#a" class="btn btn-default btn-sm">
                              <i class="glyphicon glyphicon-cog"></i>
                            </a>
                          </td>
                        </tr>

                        <tr>
                          <td colspan="12" class="hiddenRow">
                            <div class="accordian-body collapse" id="demo10">
                              <table class="table table-striped">
                                <thead>
                                  <tr>
                                    <td><a href="#a"> XPTO 1</a></td>
                                    <td>XPTO 2</td>
                                    <td>Obs</td>
                                  </tr>
                                  <tr>
                                    <th>item 1</th>
                                    <th>item 2</th>
                                    <th>item 3 </th>
                                    <th>item 4</th>
                                    <th>item 5</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>item 1</td>
                                    <td>item 2</td>
                                    <td>item 3</td>
                                    <td>item 4</td>
                                    <td>item 5</td>
                                    <td>
                                      <a href="#a" class="btn btn-default btn-sm">
                                        <i class="glyphicon glyphicon-cog"></i>
                                      </a>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>

                        <tr>
                          <td>Scrum Master</td>
                          <td>Google</td>
                          <td>U$8.00000 </td>
                          <td> 2016/09/27</td>
                          <td> 2017/09/27</td>
                          <td>
                            <a href="#a" class="btn btn-default btn-sm">
                              <i class="glyphicon glyphicon-cog"></i>
                            </a>
                          </td>
                        </tr>

                        <tr>
                          <td>Back-end</td>
                          <td>Google</td>
                          <td>U$8.00000 </td>
                          <td> 2016/09/27</td>
                          <td> 2017/09/27</td>
                          <td>
                            <a href="#a" class="btn btn-default btn-sm">
                              <i class="glyphicon glyphicon-cog"></i>
                            </a>
                          </td>
                        </tr>

                        <tr>
                          <td>Front-end</td>
                          <td>Google</td>
                          <td>U$8.00000 </td>
                          <td> 2016/09/27</td>
                          <td> 2017/09/27</td>
                          <td>
                            <a href="#a" class="btn btn-default btn-sm">
                              <i class="glyphicon glyphicon-cog"></i>
                            </a>
                          </td>
                        </tr>
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
