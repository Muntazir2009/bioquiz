/* ================= SOUND SYSTEM ================= */

/* Preload sounds (IMPORTANT for mobile) */
const correctSound = new Audio("sounds/correct.mp3");
const wrongSound   = new Audio("sounds/wrong.mp3");

/* Volume control */
correctSound.volume = 1;
wrongSound.volume = 1;

/* Unlock audio on first user interaction (mobile fix) */
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;

  correctSound.play().then(() => {
    correctSound.pause();
    correctSound.currentTime = 0;
    audioUnlocked = true;
  }).catch(() => {});

  wrongSound.play().then(() => {
    wrongSound.pause();
    wrongSound.currentTime = 0;
  }).catch(() => {});
}

/* Attach unlock to first tap */
document.addEventListener("click", unlockAudio, { once: true });
document.addEventListener("touchstart", unlockAudio, { once: true });

/* PUBLIC FUNCTIONS (USED BY quiz.js) */
window.playCorrectSound = function () {
  correctSound.currentTime = 0;
  correctSound.play().catch(() => {});
};

window.playWrongSound = function () {
  wrongSound.currentTime = 0;
  wrongSound.play().catch(() => {});
};
