const API = "https://bioquiz-suggestion.killermunu.workers.dev";

const listEl = document.getElementById("list");
const toast = document.getElementById("toast");

let adminPassword = sessionStorage.getItem("adminPass") || null;

/* ===============================
   🔔 TOAST
=============================== */
function showToast(message){
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

/* ===============================
   🔐 ASK PASSWORD (ONCE)
=============================== */
function getPassword(){
  if(adminPassword) return adminPassword;

  const pass = prompt("Enter admin password to delete:");
  if(pass){
    adminPassword = pass;
    sessionStorage.setItem("adminPass", pass);
    return pass;
  }
  return null;
}

/* ===============================
   📥 LOAD SUGGESTIONS
=============================== */
async function loadSuggestions(){

  listEl.innerHTML = `<div class="loading">Loading suggestions...</div>`;

  try{
    const res = await fetch(API);
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

/* ===============================
   🗑 DELETE WITH PASSWORD
=============================== */
function attachDeleteEvents(){
  document.querySelectorAll(".delete-btn").forEach(btn=>{
    btn.addEventListener("click", async ()=>{

      const id = btn.getAttribute("data-id");

      if(!confirm("Delete this suggestion?")) return;

      const password = getPassword();
      if(!password){
        showToast("Password required");
        return;
      }

      try{
        const res = await fetch(`${API}?id=${id}`, {
          method: "DELETE",
          headers: {
            "X-Admin-Password": password
          }
        });

        const result = await res.json();

        if(result.success){
          showToast("Suggestion deleted");
          loadSuggestions();
        }else{
          showToast("Wrong password");
          sessionStorage.removeItem("adminPass");
          adminPassword = null;
        }

      }catch(err){
        showToast("Delete failed");
      }
    });
  });
}

loadSuggestions();
