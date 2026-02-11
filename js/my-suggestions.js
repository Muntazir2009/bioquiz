const listEl = document.getElementById("list");

async function loadSuggestions() {

  try {
    const res = await fetch("https://bioquiz-suggestion.killermunu.workers.dev");
    const data = await res.json();

    if (!data.length) {
      listEl.innerHTML = `<div class="loading">No suggestions yet.</div>`;
      return;
    }

    listEl.innerHTML = "";

    data.forEach(item => {

      const card = document.createElement("div");
      card.className = "card";

      const date = new Date(item.time).toLocaleString();

      card.innerHTML = `
        <div class="card-top">
          <div class="tag">${item.type}</div>
          <div class="date">${date}</div>
        </div>

        <div class="suggestion-text">
          ${item.suggestion}
        </div>

        <div class="author">
          — ${item.name}
        </div>

        <button class="delete-btn" data-id="${item.id}">
  🗑
</button>
      `;

      listEl.appendChild(card);
    });

    attachDeleteEvents();

  } catch (err) {
    listEl.innerHTML = `<div class="loading">Failed to load suggestions.</div>`;
  }
}

function attachDeleteEvents() {
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async () => {

      const id = btn.getAttribute("data-id");

      await fetch(
        `https://bioquiz-suggestion.killermunu.workers.dev?id=${id}`,
        { method: "DELETE" }
      );

      loadSuggestions();
    });
  });
}

loadSuggestions();
