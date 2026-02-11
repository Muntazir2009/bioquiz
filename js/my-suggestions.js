const container = document.getElementById("suggestions-container");

async function loadSuggestions() {
  try {
    const res = await fetch(
      "https://bioquiz-suggestion.killermunu.workers.dev/"
    );

    const data = await res.json();

    container.innerHTML = "";

    if (!data.length) {
      container.innerHTML = "<p>No suggestions yet.</p>";
      return;
    }

    data.forEach(item => {
      const card = document.createElement("div");
      card.className = "suggestion-item";

      const date = new Date(item.time);

      card.innerHTML = `
        <h3>${item.type}</h3>
        <p>${item.suggestion}</p>
        <small>
          By ${item.name} • ${date.toLocaleString()}
        </small>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    container.innerHTML = "<p>Failed to load suggestions.</p>";
  }
}

loadSuggestions();
