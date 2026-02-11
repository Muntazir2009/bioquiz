const container = document.getElementById("list");

async function loadSuggestions() {

  container.innerHTML = "<p style='text-align:center'>Loading...</p>";

  try {
    const res = await fetch("https://bioquiz-suggestion.killermunu.workers.dev");
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = "<p style='text-align:center'>No suggestions yet.</p>";
      return;
    }

    container.innerHTML = "";

    data.forEach(item => {

      const card = document.createElement("div");
      card.className = "suggestion-card";

      card.innerHTML = `
        <div class="top-row">
          <span class="badge">${item.type}</span>
          <span class="date">${new Date(item.time).toLocaleString()}</span>
        </div>

        <p class="message">${item.suggestion}</p>
        <p class="author">— ${item.name}</p>

        <button class="delete-btn" data-id="${item.id}">
          Delete
        </button>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    container.innerHTML = "<p style='text-align:center;color:red'>Failed to load.</p>";
  }
}

document.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("delete-btn")) return;

  const id = e.target.getAttribute("data-id");

  if (!confirm("Delete this suggestion?")) return;

  await fetch(
    `https://bioquiz-suggestion.killermunu.workers.dev?id=${id}`,
    { method: "DELETE" }
  );

  loadSuggestions();
});

loadSuggestions();
