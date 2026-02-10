const list = document.getElementById("list");
const data = JSON.parse(localStorage.getItem("mySuggestions") || "[]");

if(data.length === 0){
  list.innerHTML = "<p>No suggestions yet.</p>";
}else{
  data.forEach(s=>{
    const div = document.createElement("div");
    div.className = "item";
    div.textContent = s;
    list.appendChild(div);
  });
}
