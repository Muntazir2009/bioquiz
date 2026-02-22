// ========= Identity =========
if (!localStorage.userId) {
  localStorage.userId = crypto.randomUUID();
}

function getStudyData() {
  return JSON.parse(localStorage.getItem("studyData")) || {
    userId: localStorage.userId,
    topicStats: {}
  };
}

function saveStudyData(data) {
  localStorage.setItem("studyData", JSON.stringify(data));
  syncToServer(data);
}

// ========= Adaptive Logic =========
function updateTopicStats(topic, score, total) {
  const data = getStudyData();

  if (!data.topicStats[topic]) {
    data.topicStats[topic] = {
      attempts: 0,
      accuracy: 0,
      difficulty: "easy"
    };
  }

  const stats = data.topicStats[topic];

  const oldTotalScore = stats.accuracy * stats.attempts;
  stats.attempts += 1;
  stats.accuracy = (oldTotalScore + score / total) / stats.attempts;

  if (stats.accuracy < 0.5) stats.difficulty = "easy";
  else if (stats.accuracy < 0.75) stats.difficulty = "medium";
  else stats.difficulty = "hard";

  saveStudyData(data);
}

// ========= Cloudflare Sync =========
async function syncToServer(data) {
  try {
    await fetch("https://bioquiz-suggestion.killermunu.workers.dev/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.log("Sync failed (local preserved)");
  }
}
