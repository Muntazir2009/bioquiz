/* =========================
   SOUND MODULE
========================= */

const sounds = {
  correct: new Audio("sounds/correct.mp3"),
  wrong: new Audio("sounds/wrong.mp3")
};

// volume control
sounds.correct.volume = 0.6;
sounds.wrong.volume = 0.6;

/* =========================
   PUBLIC FUNCTIONS
========================= */

function playCorrectSound() {
  sounds.correct.currentTime = 0;
  sounds.correct.play().catch(() => {});
}

function playWrongSound() {
  sounds.wrong.currentTime = 0;
  sounds.wrong.play().catch(() => {});
}

/* expose globally */
window.playCorrectSound = playCorrectSound;
window.playWrongSound = playWrongSound;
