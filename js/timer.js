let timeLeft = 20;
let timerInterval = null;
let timerStarted = false;

const timerEl = document.getElementById("timer");
const startBtn = document.getElementById("startTimerBtn");

function updateTimer(){
  timerEl.textContent = timeLeft;
}

function startTimer(){
  if(timerStarted) return;
  timerStarted = true;
  startBtn.disabled = true;

  timerInterval = setInterval(()=>{
    timeLeft--;
    updateTimer();

    if(timeLeft <= 0){
      stopTimer();
      timeUp();
    }
  },1000);
}

function resetTimer(){
  stopTimer();
  timerStarted = false;
  timeLeft = 20;
  updateTimer();
  startBtn.disabled = false;
}

function stopTimer(){
  clearInterval(timerInterval);
  timerInterval = null;
}

startBtn.onclick = startTimer;
