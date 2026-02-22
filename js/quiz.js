/* ================= QUIZ LOGIC ================= */

/* DOM */
const loading = document.getElementById("loading");
const quiz = document.getElementById("quiz");
const qEl = document.getElementById("question");
const oEl = document.getElementById("options");
const fEl = document.getElementById("feedback");
const nEl = document.getElementById("next");
const skipEl = document.getElementById("skip");
const pEl = document.getElementById("progress");
const dEl = document.getElementById("difficulty");

/* NEW UI (optional if exists) */
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");

/* STATE */
let questions = [];
let index = 0;
let locked = false;
let score = 0;
let attempted = 0;
let skipped = 0;
let timer;
let timeLeft = 20; // seconds per question

/* LOAD QUESTIONS */
fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    questions = data;
    loading.style.display = "none";
    quiz.style.display = "block";
    loadQuestion();
  })
  .catch(err => {
    console.error("Failed to load questions:", err);
  });

/* LOAD QUESTION */
function loadQuestion() {
  resetTimer();
  locked = false;
  timeLeft = 20;
  startTimer();

  nEl.style.display = "none";
  skipEl.style.display = "inline-block";
  fEl.style.display = "none";

  if (index >= questions.length) {
    finishQuiz();
    return;
  }

  const q = questions[index];

  qEl.textContent = q.question;
  pEl.textContent = `Q ${index + 1}/${questions.length}`;
  dEl.textContent = q.difficulty || "";

  if (scoreEl) {
    scoreEl.textContent = `Score: ${score}`;
  }

  oEl.innerHTML = "";

  q.options.forEach((text, i) => {
    const div = document.createElement("div");
    div.className = "option";
    div.innerHTML = `<b>${"ABCD"[i]}.</b> ${text}`;
    div.onclick = () => handleAnswer(i);
    oEl.appendChild(div);
  });
}

/* HANDLE ANSWER */
function handleAnswer(choice) {
  if (locked) return;
  locked = true;
  resetTimer();

  const q = questions[index];
  attempted++;

  if (choice === q.answer) {
    score++;
    playCorrectSound();
  } else {
    playWrongSound();
  }

  [...oEl.children].forEach((opt, i) => {
    opt.classList.add("disabled");
    if (i === q.answer) opt.classList.add("correct");
  });

  if (choice !== q.answer) {
    oEl.children[choice].classList.add("wrong");
  }

  fEl.innerHTML =
    choice === q.answer
      ? `<div class="correct"><b>Correct</b></div><p>${q.explanation || ""}</p>`
      : `<div class="wrong"><b>Incorrect</b></div>
         <p><b>Correct:</b> ${q.options[q.answer]}</p>
         <p>${q.explanation || ""}</p>`;

  if (q.fact) {
    fEl.innerHTML += `<div class="fact">💡 ${q.fact}</div>`;
  }

  fEl.style.display = "block";
  nEl.style.display = "inline-block";
  skipEl.style.display = "none";
}

/* NEXT */
nEl.onclick = () => {
  index++;
  loadQuestion();
};

/* SKIP */
skipEl.onclick = () => {
  if (locked) return;
  skipped++;
  resetTimer();
  index++;
  loadQuestion();
};

/* TIMER */
function startTimer() {
  if (!timerEl) return;

  timerEl.textContent = `Time: ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      skipped++;
      index++;
      loadQuestion();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
}

/* FINISH */
function finishQuiz() {
  resetTimer();

  const accuracy = attempted
    ? Math.round((score / attempted) * 100)
    : 0;

  quiz.innerHTML = `
    <div class="final-screen">
      <h2>Quiz Completed</h2>
      <p><b>Total Questions:</b> ${questions.length}</p>
      <p><b>Attempted:</b> ${attempted}</p>
      <p><b>Skipped:</b> ${skipped}</p>
      <p><b>Correct:</b> ${score}</p>
      <p><b>Accuracy:</b> ${accuracy}%</p>
      <button onclick="location.reload()">Retry</button>
    </div>
  `;

  /* SAVE PERFORMANCE */
  localStorage.setItem("lastQuizStats", JSON.stringify({
    score,
    attempted,
    skipped,
    accuracy,
    date: Date.now()
  }));
}
