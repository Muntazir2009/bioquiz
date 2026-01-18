/* =========================
   QUIZ MODULE – FINAL
========================= */

let quizData = [];
let index = 0;
let locked = false;

/* ELEMENTS */
const loading = document.getElementById("loading");
const quizBox = document.getElementById("quiz");

const qEl = document.getElementById("question");
const oEl = document.getElementById("options");
const fEl = document.getElementById("feedback");
const nEl = document.getElementById("next");
const pEl = document.getElementById("progress");
const dEl = document.getElementById("difficulty");

/* =========================
   LOAD QUESTIONS
========================= */

fetch("questions.json")
  .then(r => r.json())
  .then(data => {
    quizData = data;
    loading.style.display = "none";
    quizBox.style.display = "block";
    loadQuestion();
  })
  .catch(err => {
    loading.innerText = "Failed to load quiz.";
    console.error(err);
  });

/* =========================
   LOAD QUESTION
========================= */

function loadQuestion() {
  locked = false;
  resetTimer(); // reset timer but DO NOT auto start

  const q = quizData[index];

  qEl.textContent = q.question;
  pEl.textContent = `Q ${index + 1} / ${quizData.length}`;
  dEl.textContent = q.difficulty || "";

  oEl.innerHTML = "";
  fEl.style.display = "none";
  nEl.style.display = "none";

  q.options.forEach((text, i) => {
    const option = document.createElement("div");
    option.className = "option";
    option.textContent = text;

    /* 🔊 SOUND FIRES DIRECTLY ON TAP */
    option.onclick = () => {
      if (locked) return;

      if (i === q.answer) {
        playCorrectSound();
      } else {
        playWrongSound();
      }

      selectAnswer(i);
    };

    oEl.appendChild(option);
  });
}

/* =========================
   SELECT ANSWER
========================= */

function selectAnswer(i) {
  if (locked) return;
  locked = true;

  stopTimer();

  const q = quizData[index];

  [...oEl.children].forEach(opt => opt.classList.add("disabled"));

  fEl.innerHTML =
    i === q.answer
      ? `<div class="correct"><b>Correct</b></div><p>${q.explanation}</p>`
      : `<div class="wrong"><b>Incorrect</b></div>
         <p><b>Correct:</b> ${q.options[q.answer]}</p>
         <p>${q.explanation}</p>`;

  if (q.fact) {
    fEl.innerHTML += `<div class="fact">💡 ${q.fact}</div>`;
  }

  fEl.style.display = "block";
  nEl.style.display = "inline-block";
}

/* =========================
   NEXT QUESTION
========================= */

nEl.onclick = () => {
  index++;
  if (index < quizData.length) {
    loadQuestion();
  } else {
    qEl.textContent = "Quiz Completed 🎉";
    oEl.innerHTML = "";
    fEl.style.display = "none";
    nEl.style.display = "none";
  }
};

/* =========================
   TIMER TIME-UP CALLBACK
========================= */

function handleTimeUp() {
  if (locked) return;
  locked = true;

  playWrongSound();

  const q = quizData[index];

  [...oEl.children].forEach(opt => opt.classList.add("disabled"));

  fEl.innerHTML = `
    <div class="wrong"><b>Time’s up</b></div>
    <p><b>Correct:</b> ${q.options[q.answer]}</p>
    <p>${q.explanation}</p>
  `;

  if (q.fact) {
    fEl.innerHTML += `<div class="fact">💡 ${q.fact}</div>`;
  }

  fEl.style.display = "block";
  nEl.style.display = "inline-block";
}
