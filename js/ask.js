const queryInput = document.getElementById("query");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const resultDiv = document.getElementById("result");
const clockEl = document.getElementById("clock");

let controller = null;
const cache = new Map();
let history = [];
let historyIndex = -1;

/* LIVE CLOCK */
setInterval(()=>{
  clockEl.textContent = new Date().toLocaleTimeString();
},1000);

/* EVENTS */
searchBtn.onclick = execute;
clearBtn.onclick = ()=> resultDiv.innerHTML = "";

queryInput.addEventListener("keydown", e=>{
  if(e.key==="Enter") execute();

  if(e.key==="ArrowUp"){
    if(historyIndex > 0){
      historyIndex--;
      queryInput.value = history[historyIndex];
    }
  }

  if(e.key==="ArrowDown"){
    if(historyIndex < history.length-1){
      historyIndex++;
      queryInput.value = history[historyIndex];
    } else {
      queryInput.value = "";
    }
  }
});

/* MAIN EXECUTION */
async function execute(){
  const query = queryInput.value.trim();
  if(!query) return;

  if(handleCommand(query)) return;

  history.push(query);
  historyIndex = history.length;

  if(cache.has(query)){
    render(cache.get(query));
    return;
  }

  if(controller) controller.abort();
  controller = new AbortController();

  resultDiv.innerHTML = `<div class="loading">Accessing knowledge network...</div>`;

  try{
    const data = await fetchWikipedia(query);
    cache.set(query,data);
    render(data);
  }catch{
    try{
      const backup = await fetchDuckDuckGo(query);
      render(backup);
    }catch{
      resultDiv.innerHTML = "No reliable data found.";
    }
  }
}

/* PRIMARY SOURCE */
async function fetchWikipedia(query){
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
    {signal:controller.signal}
  );

  if(!res.ok) throw new Error();

  return await res.json();
}

/* BACKUP SOURCE */
async function fetchDuckDuckGo(query){
  const res = await fetch(
    `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`
  );

  const data = await res.json();

  if(!data.Abstract) throw new Error();

  return {
    title: query,
    extract: data.Abstract
  };
}

/* COMMANDS */
function handleCommand(cmd){
  const c = cmd.toLowerCase();

  if(c==="clear"){
    resultDiv.innerHTML="";
    return true;
  }

  if(c==="history"){
    resultDiv.innerHTML = history.map(h=>`> ${h}`).join("<br>");
    return true;
  }

  if(c==="help"){
    resultDiv.innerHTML = `
      Commands:<br>
      help<br>
      clear<br>
      history<br>
      about<br>
      random<br>
    `;
    return true;
  }

  if(c==="about"){
    resultDiv.innerHTML = "Mission Intelligence Panel v4.0 — Stable Core";
    return true;
  }

  if(c==="random"){
    queryInput.value = "cell biology";
    execute();
    return true;
  }

  return false;
}

/* RENDER RESULT */
function render(data){
  const words = data.extract ? data.extract.split(" ").length : 0;
  const readingTime = words ? Math.ceil(words/200) : 0;

  let html = `<h2>${data.title}</h2>`;
  html += `<p>${data.extract || "No summary available."}</p>`;

  if(data.thumbnail){
    html += `<img src="${data.thumbnail.source}">`;
  }

  html += `
    <div class="meta">
      Words: ${words} | Reading time: ${readingTime} min
    </div>
  `;

  html += `
    <div class="action-bar">
      <button onclick="copyText()">Copy</button>
      <button onclick="speakText()">Speak</button>
      <button onclick="downloadText('${data.title}')">Download</button>
      <button onclick="window.open('https://en.wikipedia.org/wiki/${data.title}','_blank')">Full Article</button>
    </div>
  `;

  resultDiv.innerHTML = html;

  window.currentText = data.extract || "";
}

/* ACTION FUNCTIONS */
function copyText(){
  navigator.clipboard.writeText(window.currentText);
}

function speakText(){
  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(window.currentText));
}

function downloadText(title){
  const blob = new Blob([window.currentText],{type:"text/plain"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = title + ".txt";
  a.click();
}
