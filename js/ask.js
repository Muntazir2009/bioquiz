const queryInput = document.getElementById("query");
const searchBtn = document.getElementById("searchBtn");
const resultDiv = document.getElementById("result");
const historyDiv = document.getElementById("history");
const clearBtn = document.getElementById("clearHistory");

/* ⭐ STARFIELD */
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
window.onresize = resize;

const stars = Array.from({length:120},()=>({
  x:Math.random()*canvas.width,
  y:Math.random()*canvas.height,
  r:Math.random()*1.2,
  s:Math.random()*0.3+0.05
}));

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  stars.forEach(star=>{
    ctx.beginPath();
    ctx.arc(star.x,star.y,star.r,0,Math.PI*2);
    ctx.fillStyle="#fff";
    ctx.fill();
    star.y+=star.s;
    if(star.y>canvas.height){
      star.y=0;
      star.x=Math.random()*canvas.width;
    }
  });
  requestAnimationFrame(animate);
}
animate();

/* SEARCH */
searchBtn.onclick = search;
queryInput.addEventListener("keypress", e=>{
  if(e.key==="Enter") search();
});

document.querySelectorAll(".chip").forEach(chip=>{
  chip.onclick = ()=>{
    queryInput.value = chip.textContent;
    search();
  };
});

async function search(){
  const query = queryInput.value.trim();
  if(!query) return;

  saveHistory(query);

  resultDiv.innerHTML = `<div class="loading">Searching...</div>`;

  try{
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
    );
    if(!res.ok) throw new Error();

    const data = await res.json();

    resultDiv.innerHTML = `
      <div class="card">
        ${data.thumbnail ? `<img src="${data.thumbnail.source}">` : ""}
        <h2>${data.title}</h2>
        <p>${data.extract}</p>
        <br>
        <a href="${data.content_urls.desktop.page}" target="_blank">
          Read full article →
        </a>
      </div>
    `;

  }catch{
    resultDiv.innerHTML = `<div class="card">No result found.</div>`;
  }
}

/* HISTORY */
function saveHistory(query){
  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  history.unshift(query);
  history = [...new Set(history)].slice(0,8);
  localStorage.setItem("searchHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory(){
  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  historyDiv.innerHTML="";
  history.forEach(item=>{
    const span = document.createElement("span");
    span.textContent = item;
    span.onclick=()=>{
      queryInput.value=item;
      search();
    };
    historyDiv.appendChild(span);
  });
}

clearBtn.onclick = ()=>{
  localStorage.removeItem("searchHistory");
  renderHistory();
};

renderHistory();
