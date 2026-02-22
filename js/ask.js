const queryInput = document.getElementById("query");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const resultDiv = document.getElementById("result");
const clockEl = document.getElementById("clock");

let controller = null;
const cache = new Map();
let history = [];

/* LIVE CLOCK */
setInterval(()=>{
  clockEl.textContent = new Date().toLocaleTimeString();
},1000);

/* EVENTS */
searchBtn.onclick = execute;
clearBtn.onclick = ()=> resultDiv.innerHTML = "";

queryInput.addEventListener("keypress", e=>{
  if(e.key==="Enter") execute();
});

/* MAIN EXECUTION */
async function execute(){
  const query = queryInput.value.trim();
  if(!query) return;

  if(handleCommand(query)) return;

  history.push(query);

  if(cache.has(query)){
    render(cache.get(query));
    return;
  }

  if(controller) controller.abort();
  controller = new AbortController();

  resultDiv.innerHTML = `<div class="loading">Processing query...</div>`;

  try{
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
      {signal:controller.signal}
    );

    if(!res.ok) throw new Error();

    const data = await res.json();
    cache.set(query,data);
    render(data);

  }catch{
    resultDiv.innerHTML = "No result found.";
  }
}

/* COMMANDS */
function handleCommand(cmd){
  cmd = cmd.toLowerCase();

  if(cmd==="clear"){
    resultDiv.innerHTML="";
    return true;
  }

  if(cmd==="history"){
    resultDiv.innerHTML = history.map(h=>`> ${h}`).join("<br>");
    return true;
  }

  if(cmd==="help"){
    resultDiv.innerHTML = `
      Commands:<br>
      help<br>
      clear<br>
      history<br>
      about
    `;
    return true;
  }

  if(cmd==="about"){
    resultDiv.innerHTML = "Mission Intelligence Panel v3.0";
    return true;
  }

  return false;
}

/* RENDER RESULT */
function render(data){
  const words = data.extract.split(" ").length;
  const readingTime = Math.ceil(words/200);

  let html = `<h2>${data.title}</h2>`;
  html += `<p>${data.extract}</p>`;

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

  window.currentText = data.extract;
}

/* ACTION FUNCTIONS */
function copyText(){
  navigator.clipboard.writeText(window.currentText);
}

function speakText(){
  speechSynthesis.speak(new SpeechSynthesisUtterance(window.currentText));
}

function downloadText(title){
  const blob = new Blob([window.currentText],{type:"text/plain"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = title + ".txt";
  a.click();
}
