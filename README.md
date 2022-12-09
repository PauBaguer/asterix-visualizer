<div align="center">
<h1 align="center">ASTERIX Message decoder<img src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/asterix_color.png" width="40"></h1>
<h4 align="center">Asterix message decorated is an application that allows the decoding of ASTERIX messages and its graphic representation over time, for Cat10 (SMR and MLAT) and Cat21 (ADS-B).</h4>
</div>

<h2>Windows Insaller <a href="https://drive.google.com/file/d/1WlXx4roW8zsHD-r-6kqVpVRViwYNzflQ/view?usp=sharing" >Download Link</a>!</h2>

<details>
  <summary><h3>👋 Introduction</h3></summary>
</details>

<details>
  <summary><h3>📝 Structure</h3></summary>

  <h4><img src="https://media2.giphy.com/media/QssGEmpkyEOhBCb7e1/giphy.gif?cid=ecf05e47a0n3gi1bfqntqmob8g9aid1oyj2wr3ds3mg700bl&rid=giphy.gif" width ="15">
General Structure Diagram</h4>

This Application has been created using the Web technologies explained in a section below. As a consequence the primary languages used have been Javascript (as Typescript), HTML and CSS.

The general architecture of the program consists on two main threads provided by an Electron App. All Electron Apps have two main processes called Main and Renderer. They can be thought of a typical server-client relation where the Renderer is a Web client and the Main thread is the server. Communication between both of them is handled by the Inter-process communication (IPC) which is a fast HTTP based information exchange. Both threads have its Workers. Workers allow the creation of new processes that are separate from the parent process thus not blocking the application on calculation-intensive tasks. Heavy calculations like file decoding, file writing and performance parameters calculations have been offloaded to Workers.

The Main thread consists on the main file (index.ts) that will launch the application and the Renderer thread. On the other hand, several functions (IPC-triggered functions) will be executed based on events sent by the Renderer (such as open a file, or give me the first 10 messages from a list). The functions are:

- loadFileIpc: open the file picker and load a file.
- sliceMainBuffer: divide a file Buffer into several Buffers containing individual messages.
- getMessagesIpcWorker: decode all the buffers in a Worker. Calls the cat10_decoder and cat21_decoder classes which handle the decoding of each message.
- getMessagesIpcSlices: send me 10000 messages.
- startCalculationOfPerformanceData: start the calculation of the performance parameters.
- parametersResults: send me the results from the parameter calculation.
- writeCsvFile: Write a csv file in a separate Worker.
- writeKmlFile: Write a kml file in a separate Worker.
- tableProtocol: Apply filters, search and give me the messages I need to render in the table based on current page.

The Renderer thread is divided in files describing the rendered objects and pages (.svelte) and the scripts (.ts) which handle the Map and Simulation logic. The main HTTP based Svelte files are App.svelte (general structure and Map), ExpandableTable.svelte (Table view) and Parameters.svelte (performance parameters view). The scripts consist on map.ts (initializing the map), graphicsLayer.ts (3D objects logic and layer management), groundLayer.ts (ground markers and layer management) and areaLayer.ts (ground areas definition). Finally Simulation.svelte handles the Sim logic and its rendered controls. Some of this work is distributed to Web-workers for a smoother operation.

<div align="center">
    <img src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/asterix_arq.drawio.png"  width = 80%>
    </div>

  <h4><img src="https://media2.giphy.com/media/QssGEmpkyEOhBCb7e1/giphy.gif?cid=ecf05e47a0n3gi1bfqntqmob8g9aid1oyj2wr3ds3mg700bl&rid=giphy.gif" width ="15">
Libraries utilized & software Stack</h4>

The main libraries utilized to produce this Web Application are the following:

- ElectronJS: Allows the creation of a Web based Desktop application for any platform (Windows, MacOS or Linux). The main architecture it provides is explained above.
- Typescript: provides type-safety on top of Javascript for a more smooth developer experience.
- Svelte.js: Frontend compiler that provides a reactive DOM and faster performance to create rich Web Applications.
- ArcGIS API for JavaScript: Lightweight yet powerful library for embedding maps and data visualization in web applications.
- Bootstrap 5: CSS Framework that provides several UI components such as buttons, menus, sliders...

Other libraries used consist on Geolib for coordinate conversion and geometric operations, GeoJSON to quickly convert to KML and Array-search for searches.

<div align="center">
    <img src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/libraries.drawio.png"  width = 80%>
    </div>

<h4><img src="https://media2.giphy.com/media/QssGEmpkyEOhBCb7e1/giphy.gif?cid=ecf05e47a0n3gi1bfqntqmob8g9aid1oyj2wr3ds3mg700bl&rid=giphy.gif" width ="15">
Main Data Classes</h4>
  
Given the nature of the Javascript language, only a few data classes have been used. On this section we explain them.

<details>
  <summary><h5>Cat10</h5></summary>

```ts
export class Cat10 {
  id: number;
  class: "Cat10";
  message_type: string;
  instrument: string;
  data_source_identifier: DataSourceIdentifier;
  target_report_description: TargetReportDescription;
  wgs_84_coordinates: WGS_84_coordinates;
  polar_coordinates: PolarCoordinates;
  cartesian_coordinates: CartesianCoordinates;
  calculated_track_velocity_polar_coordinates: PolarCoordinates;
  calculated_track_velocity_cartesian_coordinates: CartesianCoordinates;
  mod_3A_code: Mod3ACode;
  flight_level: FlightLevel;
  measured_height: string;
  amplitude_of_primary_plot: number;
  time_of_day: number;
  track_number: number;
  track_status: TrackStatus;
  calculated_acceleration: CalculatedAcceleration;
  target_address: string;
  target_identification: TargetIdentification;
  mode_s_mb_data: string[];
  target_size_and_orientation: TargetSizeAndOrientation;
  presence: Presence[];
  vehicle_fleet_identification: string;
  preprogrammed_message: PreprogrammedMessage;
  standard_deviation_of_position: StandardDeviationOfPosition;
  system_status: SystemStatus;

[...]
}
```

</details>

</details>
<details>
  <summary><h3><img src="https://media.giphy.com/media/iY8CRBdQXODJSCERIr/giphy.gif" width="25"> Eurocae ED-117 Parameters</h3></summary>  
  <h4>Probability of false identification</h4>
  <p align="justify">The probability of false identification conrresponds to the number of times that the target identifier has changed value over an average of 5 seconds. Specifications require that this percentage must be less than 0.0001%. It is considered false identification when the MLAT system identifies the target incorrectly when it is transmitting it correctly.</p>
  <h5>Implementation</h5>
  <p align="justify">For the calculation of this parameter, only the messages that come from the MLAT system are required (only from aircraft) and at the same time they must be of type "Target Report", and contain the data item of the target identification.</p>
  <p align="justify">To find the cases in which the identification has been wrong, it is necessary to check flight by flight. For this we create a HashMap, where the key corresponds to the Target Address of the aircraft (which is a unique and permanent identifier) and in it we store the start time of the window and the correct value of the Target Identification. In addition as we have to calculate this parameter based on the area in which the plane is located, we have a counter for correct identifications and false identifications for each one of them. When increasing the counter, its position is determined based on its coordinates.</p>
  <p align="justify">Following the algorithm shown in the following figure, we obtain the counters for each of the airport areas, both for false and correct identifications, the probability of false identification being the negative cases divided by the sum of both.</p>
    <div align="center">
    <img src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/ProbFalseIdentification.png"  width = 80%>
    </div>
  <h5>Results</h5>
  <p align="justify">Using the test file with the three systems at the Barcelona airport we have obtained the following results. Where "Total" corresponds to the number of windows and "False" to the number of windows with erroneous identifications. Finally, the Probability of False Identification is shown as a percentage, being the result of dividing the windows with false detections by the total.
  </p>
  <br>
    <div align="center">
    <img src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/ProbFalsaIdentificationResults.PNG"  width = 80%>
    </div>
  <br>
    <p align="justify">In all areas, the limit established in document ED-117 is met, with the exception of the stands in Terminal 2, where the detection of a false identification causes an excess of 0.0001%. However, it has been verified that in this particular case, the false identification is due to the fact that the Target Identification is changed to identify two different flights of the same aircraft, and that change occurs just inside the window.</p>
  
  <br>
  <h4>Position Accuracy</h4>
  <p align="justify">In document ED-117, it states that the maximum error between the received horizontal position of a target and
          its real position, based on the area in which the aircraft is located, must be:
          <br /> &nbsp;&nbsp;- Maneuvering area and Apron: Maximum error of 7.5 m 95% of the time. And a maximum error
          of 12 m 99% of the time.
          <br /> &nbsp;&nbsp;- Stand: Maximum error of 20 m averaged in periods of 5 seconds.
          <br /> &nbsp;&nbsp;- Type 4 area: Maximum error of 20 m 95% of the time.
          <br /> &nbsp;&nbsp;- Type 5 area: Maximum error of 40 m 95% of the time.
  </p>
  <h5>Implementation</h5>
  <p align="justify">To proceed with the accuracy calculation, the aircraft must be equipped with dgps to be able to extract its data, and therefore its exact real position. Since we do not require these data in our test files, the ADS-B info is used as a reference. To reduce the errors in the calculations we will consider as valid the ADS-B messages with a Position Integrity Category &lt; 0.3 NM. To find the MLAT and ADS-B pairs, messages with the same target address and closest in time will be searched within a 50 ms search window.
</p>
<p align="justify">Once all the accuracy measurements have been obtained, such as the distance between the actual position (obtained by the ADS-B system) and the target position (obtained by the MLAT system), the limiting parameters have been extracted to compare them with the limitations established by the EUROCAE, in addition the median of all the samples and the standard deviation have been calculated to have a more significant idea of the MLAT performance.</p>
  <h5>Results</h5>
  <p align="justify">The results obtained from the test file slightly exceed the limits established for each area. However, this is because the position taken as the real one is not exact, it has its own error, and the MLAT and ADS-B system are not synchronous, so the sum of all these uncertainties increases the error of the measurements. But if we look at the average values, these are within the acceptable limits, in addition, the standard deviation of the measurements are small, with which we can affirm that in most cases the requirements are met.</p>
  <br>
  <div align="center">
  <img src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/PositionAccuracy.PNG" width = 80%>
</div>
</details>

<details>
  <summary><h3>😄 How it works</h3></summary>
  <h5>Installation</h5>
  <p>Download the <a href="https://drive.google.com/file/d/1WlXx4roW8zsHD-r-6kqVpVRViwYNzflQ/view?usp=sharing" >executable</a> for Windows</p>
  <h5>First steps</h5>
  <p align="justify">On the main page you will find the main commands. Insert the ASTERIX file to be decoded, export the decoded data to csv or the routes to kml and control the simulation as you like.</p>
  <p align="justify">The simulation controls allow you to start, stop and restart the simulation. Also, move forwards and backwards, and change the speed of the simulation time. Decide what traffic you want to see and if you want to see or hide the different areas of the airport. By clicking on the path of an airplane you will be able to consult the main information that its message contained at that moment, you can also view the airplanes in 3D!</p>
    <br>
  
  <img src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/GeneralSettings.gif" width = 49%>
  <img src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/Navbar.gif" width = 49%>
      <h5>Map and simulation</h5>
  <p align="justify">The simulation controls allow you to start, stop and restart the simulation. Also, move forwards and backwards, and change the speed of the simulation time. Decide what traffic you want to see and if you want to see or hide the different areas of the airport. By clicking on the path of an airplane you will be able to consult the main information that its message contained at that moment, you can also view the airplanes in 3D!</p>
    <div align="center">
       <img src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/DemoFalseIdentification.PNG" width = 80%>
  </div>
  <h5>Explore all the data</h5>
  <p align="justify">Look at all the information that the different data items of the messages offer you. Filter by category, by system, by type of message. Search for a specific target address, target identification or track number and much more.</p>
    <br>
      <div align="center">
  <img src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/Table.gif" width = 80%>
  </div>
  <h5>Export data to csv...</h5>
    <div align="center">
  <img src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/DataCsv.gif" width = 80%>
  </div>
  <h5>Export routes to kml...</h5>
    <div align="center">
  <img src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/DataKml.gif" width = 80%>
  </div>
    <h5>EUROCAE ED-117 parameters</h5>
    <p align="justify">When the decoded file contains traffic from the MLAT system, the software itself will calculate the Probability False Identification and Position Accuracy parameters, to verify the operation of the sensors.</p>
    <div align="center">
       <img src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/DemoFalseIdentification.PNG" width = 80%>
  <img src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/DemoAccuracy.PNG" width = 80%>
  </div>

</details>
<i class="fa-regular fa-up-right-from-square"></i>

<h3>       <picture><img src = "https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/about_me.gif" width = 25px></picture> Contributors</h3>

- Júlia Alós
- Pau Baguer
- Dani Román
- Adrià Calvo
- Andrea Pujals
- Mireia Carvajal

<div align="center">
  <img  src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/grid-snake.svg"
       alt="snake" />
</div>
