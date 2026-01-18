/* =========================
   SOUND MODULE (UNLOCKED)
========================= */

const sounds = {
  correct: new Audio("sounds/correct.mp3"),
  wrong: new Audio("sounds/wrong.mp3")
};

// volumes
sounds.correct.volume = 0.6;
sounds.wrong.volume = 0.6;

let audioUnlocked = false;

/* 🔓 UNLOCK AUDIO ON FIRST USER GESTURE */
function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  Object.values(sounds).forEach(sound => {
    sound.play().then(() => {
      sound.pause();
      sound.currentTime = 0;
    }).catch(() => {});
  });

  document.removeEventListener("pointerdown", unlockAudio);
}

/* listen for first touch / click */
document.addEventListener("pointerdown", unlockAudio);

/* =========================
   PUBLIC PLAY FUNCTIONS
========================= */
function playCorrectSound() {
  if (!audioUnlocked) return;
  sounds.correct.currentTime = 0;
  sounds.correct.play().catch(() => {});
}

function playWrongSound() {
  if (!audioUnlocked) return;
  sounds.wrong.currentTime = 0;
  sounds.wrong.play().catch(() => {});
}

/* expose globally */
window.playCorrectSound = playCorrectSound;
window.playWrongSound = playWrongSound;
