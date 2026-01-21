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

/* STATE */
let questions = [];
let index = 0;
let locked = false;

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

  nEl.style.display = "none";
  skipEl.style.display = "inline-block";
  fEl.style.display = "none";

  if (index >= questions.length) {
    qEl.textContent = "Quiz completed!";
    oEl.innerHTML = "";
    pEl.textContent = "";
    dEl.textContent = "";
    skipEl.style.display = "none";
    return;
  }

  const q = questions[index];

  qEl.textContent = q.question;
  pEl.textContent = `Q ${index + 1}/${questions.length}`;
  dEl.textContent = q.difficulty || "";

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

  /* STOP TIMER */
  resetTimer();

  const q = questions[index];

  if (choice === q.answer) {
    playCorrectSound();
  } else {
    playWrongSound();
  }

  [...oEl.children].forEach(opt => opt.classList.add("disabled"));

  fEl.innerHTML =
    choice === q.answer
      ? `<div class="correct"><b>Correct</b></div><p>${q.explanation}</p>`
      : `<div class="wrong"><b>Incorrect</b></div>
         <p><b>Correct:</b> ${q.options[q.answer]}</p>
         <p>${q.explanation}</p>`;

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
  resetTimer();
  index++;
  loadQuestion();
};
