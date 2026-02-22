let currentTopic = "";
let currentText = "";

async function searchTopic() {
  const query = document.getElementById("query").value;
  currentTopic = query;

  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
  );
  const data = await res.json();

  currentText = data.extract;

  document.getElementById("result").innerHTML =
    `<h2>${data.title}</h2><p>${data.extract}</p>`;
}

function openModeSelector() {
  document.getElementById("modeModal").classList.remove("hidden");
}

function startQuiz(mode) {
  document.getElementById("modeModal").classList.add("hidden");

  const questions = generateConceptQuiz(currentText, mode);

  sessionStorage.setItem("generatedQuiz", JSON.stringify({
    topic: currentTopic,
    mode,
    questions
  }));

  window.location.href = "quiz.html";
}

// ===== Concept-based Generator =====
function generateConceptQuiz(text, mode) {
  const sentences = text.split(". ").filter(s => s.length > 50);

  return sentences.slice(0, 5).map(sentence => {
    const words = sentence.split(" ");
    const correct = words[Math.floor(Math.random() * words.length)];

    const options = new Set([correct]);

    while (options.size < 4) {
      options.add(words[Math.floor(Math.random() * words.length)]);
    }

    return {
      question: sentence.replace(correct, "_____"),
      options: Array.from(options),
      answer: Array.from(options).indexOf(correct)
    };
  });
}
