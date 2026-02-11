const WORKER_URL = "https://bioquiz-suggestion.killermunu.workers.dev";

const listEl = document.getElementById("list");
const statsEl = document.getElementById("stats");

async function loadSuggestions(){
  try{
    const res = await fetch(WORKER_URL);
    const data = await res.json();

    if(!data.length){
      listEl.innerHTML = '<div class="empty">No suggestions yet.</div>';
      statsEl.textContent = "0 Suggestions";
      return;
    }

    // Sort newest first
    data.sort((a,b)=> new Date(b.time) - new Date(a.time));

    statsEl.textContent = data.length + " Suggestions";
    listEl.innerHTML = "";

    data.forEach(item => {

      const card = document.createElement("div");
      card.className = "card";

      const date = new Date(item.time);

      card.innerHTML = `
        <div class="card-top">
          <div class="type">${item.type}</div>
          <div class="time">${date.toLocaleString()}</div>
        </div>

        <div class="name">${item.name}</div>
        <div class="text">${item.suggestion}</div>

        <button class="delete-btn">Delete</button>
      `;

      card.querySelector(".delete-btn").onclick = async () => {

        if(!confirm("Delete this suggestion?")) return;

        await fetch(WORKER_URL + "?id=" + item.id, {
          method:"DELETE"
        });

        loadSuggestions();
      };

      listEl.appendChild(card);
    });

  }catch(err){
    listEl.innerHTML = '<div class="empty">Error loading suggestions.</div>';
    statsEl.textContent = "Error";
  }
}

loadSuggestions();
