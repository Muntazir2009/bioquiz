const list = document.getElementById("list");
const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");
const sortSelect = document.getElementById("sort");
const countText = document.getElementById("count");

let allSuggestions = [];

async function loadSuggestions(){
  try{
    const res = await fetch("https://bioquiz-suggestion.killermunu.workers.dev");
    const data = await res.json();

    allSuggestions = data.filter(s => s.name); // remove garbage entries
    render();

  }catch(err){
    list.innerHTML = `<p class="empty">Failed to load suggestions.</p>`;
  }
}

function render(){
  let filtered = [...allSuggestions];

  const searchValue = searchInput.value.toLowerCase();
  const filterValue = filterSelect.value;
  const sortValue = sortSelect.value;

  // Search
  if(searchValue){
    filtered = filtered.filter(s =>
      s.suggestion.toLowerCase().includes(searchValue) ||
      s.name.toLowerCase().includes(searchValue)
    );
  }

  // Filter
  if(filterValue !== "all"){
    filtered = filtered.filter(s => s.type === filterValue);
  }

  // Sort
  filtered.sort((a,b)=>{
    return sortValue === "new"
      ? new Date(b.time) - new Date(a.time)
      : new Date(a.time) - new Date(b.time);
  });

  countText.textContent = `${filtered.length} Suggestions`;

  if(filtered.length === 0){
    list.innerHTML = `<p class="empty">No suggestions found.</p>`;
    return;
  }

  list.innerHTML = filtered.map(s => `
    <div class="card">
      <div class="card-top">
        <span class="type">${s.type || "Other"}</span>
        <span class="time">${new Date(s.time).toLocaleString()}</span>
      </div>
      <div class="message">${s.suggestion}</div>
      <div class="author">— ${s.name}</div>
    </div>
  `).join("");
}

searchInput.addEventListener("input", render);
filterSelect.addEventListener("change", render);
sortSelect.addEventListener("change", render);

loadSuggestions();
