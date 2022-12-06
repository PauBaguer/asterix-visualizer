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

</details>

<details>
  <summary><h3>😄 How it works</h3></summary>  

</details>

<h3>       <picture><img src = "https://github.com/0xAbdulKhalid/0xAbdulKhalid/raw/main/assets/mdImages/about_me.gif" width = 25px></picture> Contributors</h3>

- Júlia Alós
- Pau Baguer


<div align="center">
  <a href="https://1999azzar.github.io/1999AZZAR/">
  <img  src="https://github.com/1999AZZAR/1999AZZAR/blob/main/resources/img/grid-snake.svg"
       alt="snake" /></a>
</div>
