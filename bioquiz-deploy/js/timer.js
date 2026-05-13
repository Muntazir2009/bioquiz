/* ================= TIMER SYSTEM ================= */

/* CONFIG */
const TOTAL_TIME = 15; // seconds

let timeLeft = TOTAL_TIME;
let interval = null;
let running = false;

/* ELEMENTS */
const timerEl   = document.getElementById("timer");
const ring      = document.querySelector(".timer-ring circle");
const timerWrap = document.getElementById("timerWrap");

/* SOUND */
const timerSound = new Audio("sounds/timer.mp3");
timerSound.loop = true;
timerSound.volume = 0.4;

/* CIRCLE */
const FULL = 113;

/* --------- CORE FUNCTIONS --------- */

function updateRing() {
  ring.style.strokeDashoffset =
    FULL - (timeLeft / TOTAL_TIME) * FULL;
}

function resetTimer() {
  clearInterval(interval);
  interval = null;
  running = false;

  timeLeft = TOTAL_TIME;
  timerEl.textContent = TOTAL_TIME;
  ring.style.strokeDashoffset = 0;

  timerSound.pause();
  timerSound.currentTime = 0;
}

function startTimer() {
  if (running) return;

  running = true;

  timerSound.play().catch(() => {});

  interval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    updateRing();

    if (timeLeft <= 0) {
      stopTimer();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(interval);
  interval = null;
  running = false;

  timerSound.pause();
  timerSound.currentTime = 0;
}

/* --------- EVENTS --------- */

timerWrap.addEventListener("click", startTimer);

/* --------- GLOBAL ACCESS (USED BY quiz.js) --------- */

window.resetTimer = resetTimer;
window.stopTimer  = stopTimer;
