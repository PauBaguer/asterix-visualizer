<div align="center">
<h1 align="center">Asterix decoder</h1>
<h4 align="center">Asterix decorated is an application that allows the decoding of ASTERIX messages and its graphic representation over time, for Cat10 (SMR and MLAT) and Cat21 (ADS-B).</h4>
</div>

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
  <p>The probability of false identification conrresponds to the number of times that the target identifier has changed value over an average of 5 seconds. Specifications require that this percentage must be less than 0.0001%. It is considered false identification when the MLAT system identifies the target incorrectly when it is transmitting it correctly.</p>
  <h6>Implementation</h6>
  <p>For the calculation of this parameter, only the messages that come from the MLAT system are required (only from aircraft) and at the same time they must be of type "Target Report", and contain the data item of the target identification.</p>
  <p>To find the cases in which the identification has been wrong, it is necessary to check flight by flight. For this we create a HashMap, where the key corresponds to the Target Address of the aircraft (which is a unique and permanent identifier) and in it we store the start time of the window and the correct value of the Target Identification. In addition as we have to calculate this parameter based on the area in which the plane is located, we have a counter for correct identifications and false identifications for each one of them. When increasing the counter, its position is determined based on its coordinates.</p>
  <p>Following the algorithm shown in the following figure, we obtain the counters for each of the airport areas, both for false and correct identifications, the probability of false identification being the negative cases divided by the sum of both.</p>
    <img src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/ProbFalseIdentification.png">
  <h6>Results</h6>
  <br>
  <h4>Position Accuracy</h4>
  <p>In document ED-117, it states that the maximum error between the received horizontal position of a target and
          its real position, based on the area in which the aircraft is located, must be:
          <br /> &nbsp;&nbsp;- Maneuvering area and Apron: Maximum error of 7.5 m 95% of the time. And a maximum error
          of 12 m 99% of the time.
          <br /> &nbsp;&nbsp;- Stand: Maximum error of 20 m averaged in periods of 5 seconds.
          <br /> &nbsp;&nbsp;- Type 4 area: Maximum error of 20 m 95% of the time.
          <br /> &nbsp;&nbsp;- Type 5 area: Maximum error of 40 m 95% of the time.
  </p>
  <h6>Implementation</h6>
  <p>To proceed with the accuracy calculation, the aircraft must be equipped with dgps to be able to extract its data, and therefore its exact real position. Since we do not require these data in our test files, the ADS-B info is used as a reference. To reduce the errors in the calculations we will consider as valid the ADS-B messages with a Position Integrity Category &lt; 0.3 NM. To find the MLAT and ADS-B pairs, messages with the same target address and closest in time will be searched within a 50 ms search window.

  <h6>Results</h6>

</details>

<details>
  <summary><h3>😄 How it works</h3></summary>  

</details>

<h3>       <picture><img src = "https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/about_me.gif" width = 25px></picture> Contributors</h3>

- Júlia Alós
- Pau Baguer


<div align="center">
  <img  src="https://github.com/PauBaguer/asterix-visualizer/blob/master/assets/grid-snake.svg"
       alt="snake" />
</div>
