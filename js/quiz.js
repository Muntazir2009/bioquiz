const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultBox = document.getElementById("result");
const generateBtn = document.getElementById("generateBtn");
const modeButtons = document.querySelectorAll(".mode-btn");

let selectedMode = "Quick";
let lastTopic = "";

/* MODE SELECT */
modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedMode = btn.textContent;
  });
});

/* SEARCH */
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (!query) return;

  lastTopic = query;

  resultBox.innerHTML = `
    <h2>${query}</h2>
    <p>Loading information...</p>
  `;

  fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${query}`)
    .then(res => res.json())
    .then(data => {
      resultBox.innerHTML = `
        <h2>${data.title}</h2>
        <p>${data.extract}</p>
      `;
    })
    .catch(() => {
      resultBox.innerHTML = `<p>Failed to fetch info.</p>`;
    });
});

/* GENERATE QUIZ */
generateBtn.addEventListener("click", () => {
  if (!lastTopic) {
    alert("Search a topic first.");
    return;
  }

  const quizData = {
    topic: lastTopic,
    mode: selectedMode,
    questions: [
      {
        question: `What is ${lastTopic}?`,
        options: [
          "A celestial object",
          "A chemical element",
          "A biological cell",
          "A mathematical constant"
        ],
        answer: 0
      }
    ]
  };

  sessionStorage.setItem("generatedQuiz", JSON.stringify(quizData));
  window.location.href = "quiz.html";
});
