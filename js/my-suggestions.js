const listEl = document.getElementById("list");
const toast = document.getElementById("toast");

function showToast(message){
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

async function loadSuggestions(){

  listEl.innerHTML = `<div class="loading">Loading suggestions...</div>`;

  try{
    const res = await fetch("https://bioquiz-suggestion.killermunu.workers.dev");
    const data = await res.json();

    if(!data.length){
      listEl.innerHTML = `<div class="loading">No suggestions yet.</div>`;
      return;
    }

    listEl.innerHTML = "";

    data.forEach(item => {

      const card = document.createElement("div");
      card.className = "card";

      const date = item.time
        ? new Date(item.time).toLocaleString()
        : "Unknown date";

      card.innerHTML = `
        <div class="badge">${item.type || "Other"}</div>
        <div class="date">${date}</div>

        <div class="text">
          ${item.suggestion || ""}
        </div>

        <div class="author">
          — ${item.name || "Anonymous"}
        </div>

        <button class="delete-btn" data-id="${item.id}">
          🗑
        </button>
      `;

      listEl.appendChild(card);
    });

    attachDeleteEvents();

  }catch(err){
    listEl.innerHTML = `<div class="loading">Failed to load suggestions.</div>`;
  }
}

function attachDeleteEvents(){
  document.querySelectorAll(".delete-btn").forEach(btn=>{
    btn.addEventListener("click", async ()=>{

      const id = btn.getAttribute("data-id");

      if(!confirm("Delete this suggestion?")) return;

      const res = await fetch(
        `https://bioquiz-suggestion.killermunu.workers.dev?id=${id}`,
        { method:"DELETE" }
      );

      if(res.ok){
        showToast("Suggestion deleted");
        loadSuggestions();
      }else{
        showToast("Delete failed");
      }
    });
  });
}

loadSuggestions();
