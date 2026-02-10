const list = document.getElementById("list");
const data = JSON.parse(localStorage.getItem("mySuggestions") || "[]");

if(data.length === 0){
  list.innerHTML = "<p style='opacity:.6;text-align:center'>No suggestions yet 🌌</p>";
}else{
  data.forEach(s=>{
    const div = document.createElement("div");
    div.className="card";
    div.innerHTML=`
      <div class="meta">
        <span>${s.type}</span>
        <span>${s.date}</span>
      </div>
      <div class="text">${s.text}</div>
    `;
    list.appendChild(div);
  });
}
