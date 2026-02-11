const list = document.getElementById("suggestionsList");

fetch("https://bioquiz-suggestion.killermunu.workers.dev/list")
  .then(res => res.json())
  .then(data => {
    if (!data.length) {
      list.innerHTML = "<p>No suggestions yet.</p>";
      return;
    }

    data.reverse().forEach(item => {
      const card = document.createElement("div");
      card.className = "suggestion-item";

      card.innerHTML = `
        <h3>${item.type}</h3>
        <p>${item.suggestion}</p>
        <span>— ${item.name}</span>
      `;

      list.appendChild(card);
    });
  })
  .catch(() => {
    list.innerHTML = "<p>Failed to load suggestions.</p>";
  });
