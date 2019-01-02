var socket = null;
//So many variables, not all are needed. Needs cleanup
let motionDebug = document.getElementById("motionDebug");
let speedDebug = document.getElementById("speedDebug");
let resetButton = document.getElementById("resetButton");
let beats = [
  [400, 400, 400, 400, 400, 400, 400, 400]
]
let currentBeat = [];
let userBeats = [];
let startTime = new Date();
let endTime = new Date();
let oldEndTime = new Date();
let moving = false;
let timerStarted = false;
let onBeat = false;
let controlValue = 0;
let checkedSync = false;
let timeDiffInSeconds = 0;
let motionCheckValue = 3;

if (document.readyState != 'loading') ready();
else document.addEventListener('DOMContentLoaded', ready);

function ready() {
  const url = 'ws://' + location.host + '/ws';
  socket = new ReconnectingWebsocket(url);

  resetButton.addEventListener("click", function() {
    userBeats.length = 0;
    currentBeat.length = 0;
  });

  //get the square to dispaly on screen
  socket.onmessage = function(evt) {
    logReceived(evt.data);
    if (evt.data == 'Pattern1') {

      vibrate();
    }
    if (evt.data == 'Pattern2') {

      vibrate2();
    }
    if (evt.data == 'Pattern3') {

      vibrate3();
    }
  };

  //Get the elements from startPattern1
  document.getElementById("startPattern1").addEventListener('click', function() {
    send("Pattern1");
    console.log ("hello1");
  });

  function vibrate() {
    window.navigator.vibrate([400, 400, 400, 400, 400, 400, 400, 400]);
  }

  function vibrate2() {
    window.navigator.vibrate([250, 400, 250, 400, 250]);
  }

  function vibrate3() {
    window.navigator.vibrate([750, 50, 750, 50, 750, 50, 750]);
  }



  //Get the elements from startPattern2
  document.getElementById("startPattern2").addEventListener('click', function() {
    send("Pattern2");
    console.log ("hello2");
  });

  document.getElementById("startPattern3").addEventListener('click', function() {
    send("Pattern3");
    console.log ("hello");
  });

  if (window.DeviceMotionEvent == undefined) {
    //No accelerometer is present. Use buttons. 
    //alert("no accelerometer");
}
else {
    //alert("accelerometer found");
    window.addEventListener("devicemotion", accelerometerUpdate, true);
}

} 

//Run function when accelerometer updates
function accelerometerUpdate(e) {
  //Bunch of stuff to calculate motion
  let aX = event.acceleration.x*1;
  let aY = event.acceleration.y*1;
  let aZ = event.acceleration.z*1; 
  let xPosition = Math.atan2(aY, aZ);
  let yPosition = Math.atan2(aX, aZ);
  let avgMotion = Math.abs((aX + aY + aZ) / 3);
  //Set beat start time if motion is fast enough
  if(avgMotion > motionCheckValue) {
    moving = true;
    timerStarted = false;
     if(!timerStarted) {
      startTime = new Date();
      timerStarted = true;
    } 
  }
  //Set beat end time if motion is slow enough
   else if(moving && avgMotion < 0.3) {
    if(timerStarted) {
      oldEndTime = endTime;
      endTime = new Date();
      timerStarted = false;
      let timeDifference = (oldEndTime.getTime() - endTime.getTime());
      timeDiffInSeconds = Math.abs(timeDifference / 1000);
      userBeats.push(timeDiffInSeconds);
    } 
    moving = false;
  }
  if(!moving && userBeats.length > 2) {
    //Set control value based on the first two beats
    controlValue = Math.abs(userBeats[0] - userBeats[1]);
    //Loop through recorded beats and check if each is within a certain tolerance of the control value
    for(let i = 0; i < userBeats.length; i ++) {
      let difference = Math.abs(userBeats[i - 1] - userBeats[i]);
      if(Math.abs(controlValue - difference) < 800) {
        motionDebug.innerHTML = "on beat!";
        motionDebug.style.fontSize = "40px";      
        onBeat = true; 
      }
      else {
        motionDebug.innerHTML = "off beat!";
        motionDebug.style.fontSize = "30px";
        onBeat = false;
    }
    //Transfer user beats to new array
    if(!checkedSync) {
      for(let [index, beat] of userBeats.entries()) {
        currentBeat.push(beat - 100);
        currentBeat.push(100);
      }
      //Vibrate beat back to user, currently not very reliable
      window.navigator.vibrate(currentBeat);
        checkedSync = true;
    }
  }
}

//check if shake is supported or not.
if(!("ondevicemotion" in window)){alert("Not Supported");}

function send(str) {
  console.log(new Date().toLocaleTimeString() +  '> ' + str);
  socket.send(str);
}

function logReceived(d) {
  document.getElementById('lastMsg').innerHTML = d + '<br />' + document.getElementById('lastMsg').innerHTML;
}}