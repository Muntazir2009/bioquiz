const container = document.getElementById("suggestionsContainer");
const loader = document.getElementById("loader");

async function loadSuggestions() {
  try {
    const res = await fetch(
      "https://bioquiz-suggestion.killermunu.workers.dev"
    );

    if (!res.ok) throw new Error("Failed to fetch");

    const data = await res.json();

    loader.style.display = "none";

    if (!data.length) {
      container.innerHTML = `
        <div class="empty-state">
          No suggestions yet 🚀
        </div>
      `;
      return;
    }

    // newest first
    data.reverse();

    data.forEach(entry => {
      const card = document.createElement("div");
      card.className = "suggestion-item";

      card.innerHTML = `
        <div class="suggestion-header">
          <span class="suggestion-type">${entry.type}</span>
          <span class="suggestion-time">
            ${new Date(entry.time).toLocaleString()}
          </span>
        </div>

        <div class="suggestion-body">
          ${entry.suggestion}
        </div>

        <div class="suggestion-author">
          — ${entry.name}
        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    loader.style.display = "none";
    container.innerHTML = `
      <div class="error-state">
        ⚠ Failed to load suggestions.
      </div>
    `;
  }
}

loadSuggestions();
