<div align="center">
<h1 align="center">Asterix decoder</h1>
<h4 align="center">Asterix decorated is an application that allows the decoding of ASTERIX messages and its graphic representation over time, for Cat10 (SMR and MLAT) and Cat21 (ADS-B).</h4>
</div>

<h2>Windows Insaller <a href="https://drive.google.com/file/d/1WlXx4roW8zsHD-r-6kqVpVRViwYNzflQ/view?usp=sharing" >Download Link!</a></h2>

<details>
  <summary><h3>👋 Introduction</h3></summary>
</details>

<details>
  <summary><h3>📝 Structure</h3></summary>
  <h4><img src="https://media2.giphy.com/media/QssGEmpkyEOhBCb7e1/giphy.gif?cid=ecf05e47a0n3gi1bfqntqmob8g9aid1oyj2wr3ds3mg700bl&rid=giphy.gif" width ="15">
Backend</h4>
<h4><img src="https://media2.giphy.com/media/QssGEmpkyEOhBCb7e1/giphy.gif?cid=ecf05e47a0n3gi1bfqntqmob8g9aid1oyj2wr3ds3mg700bl&rid=giphy.gif" width ="15">
Frontend</h4>
  
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
  <p>Download the executable for Windows https://drive.google.com/file/d/1XoyGfE5QBPgHJeWnLBNFW0jxYp-_xzOt/view</p>
  <h5>First steps</h5>
  <p align="justify">On the main page you will find the main commands. Insert the ASTERIX file to be decoded, export the decoded data to csv or the routes to kml and control the simulation as you like.</p>
  <p align="justify">When all the messages are properly processed you will be able to navigate through the different tabs and all the information obtained.</p>
  <br>
  <img src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/GeneralSettings.gif" width = 48%>
  <img src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/Navbar.gif" width = 48%>

  <h5>Explore all the data</h5>
  <p align="justify">Look at all the information that the different data items of the messages offer you. Filter by category, by system, by type of message. Search for a specific target address, target identification or track number and much more.</p>
    <br>
  <img src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/Table.gif.gif" width = 80%>
  <h5>Export data to csv</h5>
    <div align="center">
  <img src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/DataCsv.gif" width = 80%>
  </div>
  <h5>Export routes to kml</h5>
    <div align="center">
  <img src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/DataKml.gif" width = 80%>
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
