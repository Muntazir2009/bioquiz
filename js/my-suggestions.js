const container = document.getElementById("list");

const WORKER_URL = "https://bioquiz-suggestion.killermunu.workers.dev";

async function loadSuggestions() {
  container.innerHTML = "<p style='text-align:center;opacity:.6'>Loading...</p>";

  try {
    const res = await fetch(WORKER_URL);

    if (!res.ok) throw new Error("Failed to fetch");

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = `
        <p style="text-align:center;opacity:.6">
          No suggestions yet.
        </p>
      `;
      return;
    }

    // Sort newest first
    data.sort((a, b) => new Date(b.time) - new Date(a.time));

    container.innerHTML = "";

    data.forEach(item => {
      // Skip invalid entries
      if (!item.name || !item.type || !item.suggestion || !item.time) return;

      const card = document.createElement("div");
      card.className = "suggestion-card";

      card.innerHTML = `
        <div class="suggestion-top">
          <span class="suggestion-type">${item.type}</span>
          <span class="suggestion-date">
            ${new Date(item.time).toLocaleString()}
          </span>
        </div>

        <div class="suggestion-body">
          <p>${item.suggestion}</p>
        </div>

        <div class="suggestion-footer">
          — ${item.name || "Anonymous"}
        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    container.innerHTML = `
      <p style="text-align:center;color:#ff6b6b">
        Failed to load suggestions.
      </p>
    `;
  }
}

loadSuggestions();
