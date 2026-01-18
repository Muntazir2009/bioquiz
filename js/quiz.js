/* =========================
   QUIZ LOGIC – FINAL
========================= */

let quizData = [];
let i = Number(localStorage.getItem("quizIndex")) || 0;
let locked = false;

/* ELEMENTS */
const loading = document.getElementById("loading");
const quiz = document.getElementById("quiz");

const qEl = document.getElementById("question");
const oEl = document.getElementById("options");
const fEl = document.getElementById("feedback");
const nEl = document.getElementById("next");
const pEl = document.getElementById("progress");
const dEl = document.getElementById("difficulty");
const skipBtn = document.getElementById("skip");

/* =========================
   LOAD QUESTIONS
========================= */

fetch("questions.json")
  .then(r => r.json())
  .then(data => {
    quizData = data;

    /* 🔑 REMOVE LOADING SCREEN */
    loading.style.display = "none";
    quiz.style.display = "block";

    load();
  })
  .catch(err => {
    console.error(err);
    loading.innerText = "Failed to load quiz.";
  });

/* =========================
   SHUFFLE OPTIONS
========================= */
function shuffleOptions(q) {
  const correct = q.options[q.answer];
  q.options = q.options
    .map(o => ({ o, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(x => x.o);

  q.answer = q.options.indexOf(correct);
}

/* =========================
   LOAD QUESTION
========================= */
function load() {
  locked = false;

  resetTimer(); // ⏱ reset timer but DO NOT start

  const q = quizData[i];
  shuffleOptions(q);

  qEl.textContent = q.question;
  pEl.textContent = `Q ${i + 1} / ${quizData.length}`;
  dEl.textContent = q.difficulty || "";

  oEl.innerHTML = "";
  oEl.classList.remove("focused");

  fEl.style.display = "none";
  nEl.style.display = "none";

  q.options.forEach((text, idx) => {
    const div = document.createElement("div");
    div.className = "option";
    div.innerHTML = `<span class="label">${"ABCD"[idx]}.</span> ${text}`;
    div.onclick = () => select(idx);
    oEl.appendChild(div);
  });

  localStorage.setItem("quizIndex", i);
}

/* =========================
   SELECT OPTION
========================= */
function select(idx) {
  if (locked) return;
  locked = true;

  stopTimer(); // ⏱ stop timer when answered

  oEl.classList.add("focused");

  [...oEl.children].forEach((o, j) =>
    j === idx ? o.classList.add("focus") : o.classList.add("fade")
  );

  const q = quizData[i];

  if (idx === q.answer) {
    localStorage.setItem(
      "correct",
      Number(localStorage.getItem("correct") || 0) + 1
    );
    playCorrectSound();
  } else {
    playWrongSound();
  }

  localStorage.setItem("total", quizData.length);

  let html =
    idx === q.answer
      ? `<div class="correct"><b>Correct</b></div><p>${q.explanation}</p>`
      : `<div class="wrong"><b>Incorrect</b></div>
         <p><b>Correct:</b> ${q.options[q.answer]}</p>
         <p>${q.explanation}</p>`;

  if (q.fact) html += `<div class="fact">💡 ${q.fact}</div>`;

  fEl.innerHTML = html;
  fEl.style.display = "block";

  setTimeout(() => (nEl.style.display = "inline-block"), 500);
}

/* =========================
   NEXT / SKIP
========================= */
nEl.onclick = nextQuestion;
skipBtn.onclick = nextQuestion;

function nextQuestion() {
  if (!locked) stopTimer();

  i++;
  if (i < quizData.length) {
    load();
  } else {
    localStorage.removeItem("quizIndex");
    location.href = "results.html";
  }
}

/* =========================
   TIMER TIME-UP HANDLER
========================= */
function handleTimeUp() {
  if (locked) return;
  locked = true;

  playWrongSound();

  const q = quizData[i];

  oEl.classList.add("focused");
  [...oEl.children].forEach(o => o.classList.add("fade"));

  fEl.innerHTML = `
    <div class="wrong"><b>Time’s up</b></div>
    <p><b>Correct:</b> ${q.options[q.answer]}</p>
    <p>${q.explanation}</p>
  `;

  fEl.style.display = "block";
  nEl.style.display = "inline-block";
}
