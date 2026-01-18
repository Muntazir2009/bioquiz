// ---------------- STATE ----------------
let quizData = [];
let i = Number(localStorage.getItem("quizIndex")) || 0;
let locked = false;

// ---------------- ELEMENTS ----------------
const loading = document.getElementById("loading");
const quizBox = document.getElementById("quiz");

const qEl = document.getElementById("question");
const oEl = document.getElementById("options");
const fEl = document.getElementById("feedback");
const nEl = document.getElementById("next");
const pEl = document.getElementById("progress");
const dEl = document.getElementById("difficulty");
const skipBtn = document.getElementById("skip");

// ---------------- FETCH QUESTIONS ----------------
fetch("questions.json")
  .then(r => r.json())
  .then(d => {
    quizData = d;

    // 🔑 HIDE LOADER, SHOW QUIZ
    loading.style.display = "none";
    quizBox.style.display = "block";

    load();
  })
  .catch(err => {
    loading.innerHTML = "Failed to load quiz.";
    console.error(err);
  });

// ---------------- UTIL ----------------
function shuffleOptions(q){
  const correct = q.options[q.answer];
  q.options = q.options
    .map(o => ({ o, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(x => x.o);
  q.answer = q.options.indexOf(correct);
}

// ---------------- LOAD QUESTION ----------------
function load(){
  locked = false;
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

  // 🔑 RESET TIMER (manual start)
  if (typeof resetTimer === "function") {
    resetTimer();
  }
}

// ---------------- SELECT OPTION ----------------
function select(idx){
  if (locked) return;
  locked = true;

  if (typeof stopTimer === "function") {
    stopTimer();
  }

  oEl.classList.add("focused");
  [...oEl.children].forEach((o, j) =>
    j === idx ? o.classList.add("focus") : o.classList.add("fade")
  );

  const q = quizData[i];
  const correct = idx === q.answer;

  if (correct) {
    playSound("correct");
    localStorage.setItem(
      "correct",
      Number(localStorage.getItem("correct") || 0) + 1
    );
  } else {
    playSound("wrong");
  }

  localStorage.setItem("total", quizData.length);

  let html = correct
    ? `<div class="correct"><b>Correct</b></div><p>${q.explanation}</p>`
    : `<div class="wrong"><b>Incorrect</b></div>
       <p><b>Correct:</b> ${q.options[q.answer]}</p>
       <p>${q.explanation}</p>`;

  if (q.fact) {
    html += `<div class="fact"><b>Fact:</b> ${q.fact}</div>`;
  }

  fEl.innerHTML = html;
  fEl.style.display = "block";

  setTimeout(() => {
    nEl.style.display = "inline-block";
  }, 500);
}

// ---------------- TIME UP (CALLED BY timer.js) ----------------
function handleTimeUp(){
  if (locked) return;
  locked = true;

  playSound("wrong");

  const q = quizData[i];

  fEl.innerHTML = `
    <div class="wrong"><b>Time’s up!</b></div>
    <p><b>Correct:</b> ${q.options[q.answer]}</p>
    <p>${q.explanation}</p>
    ${q.fact ? `<div class="fact"><b>Fact:</b> ${q.fact}</div>` : ""}
  `;
  fEl.style.display = "block";
  nEl.style.display = "inline-block";
}

// ---------------- NEXT ----------------
nEl.onclick = () => {
  i++;
  if (i < quizData.length) {
    load();
  } else {
    localStorage.removeItem("quizIndex");
    location.href = "results.html";
  }
};

// ---------------- SKIP ----------------
skipBtn.onclick = () => {
  if (locked) return;
  i++;
  if (i < quizData.length) {
    load();
  } else {
    localStorage.removeItem("quizIndex");
    location.href = "results.html";
  }
};
