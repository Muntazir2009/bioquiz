let timeLeft = 15;
let interval = null;
let running = false;

const timerEl = document.getElementById("timer");
const ring = document.querySelector(".timer-ring circle");
const timerWrap = document.getElementById("timerWrap");

const FULL = 113;

function resetTimer(){
  clearInterval(interval);
  running = false;
  timeLeft = 15;
  timerEl.textContent = 15;
  ring.style.strokeDashoffset = 0;
  stopTimerSound();
}

function startTimer(){
  if (running) return;
  running = true;

  playTimerSound();

  interval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    ring.style.strokeDashoffset = FULL - (timeLeft / 15) * FULL;

    if (timeLeft <= 0) {
      stopTimer();
    }
  }, 1000);
}

function stopTimer(){
  clearInterval(interval);
  running = false;
  stopTimerSound();
}

timerWrap.onclick = startTimer;

window.resetTimer = resetTimer;
window.stopTimer  = stopTimer;
