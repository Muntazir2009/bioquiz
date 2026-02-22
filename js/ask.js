/* ================= DOM ================= */

const queryInput = document.getElementById("query");
const searchBtn  = document.getElementById("searchBtn");
const clearBtn   = document.getElementById("clearBtn");
const resultDiv  = document.getElementById("result");
const clockEl    = document.getElementById("clock");
const themeSwitcher = document.getElementById("themeSwitcher");

/* ================= STATE ================= */

let controller = null;
const cache = new Map();
let history = [];
let voices = [];

/* ================= LIVE CLOCK ================= */

setInterval(()=>{
  clockEl.textContent = new Date().toLocaleTimeString();
},1000);

/* ================= THEME SYSTEM ================= */

const themes = {
  blue:{
    primary:"#00c8ff",
    text:"#8fdfff",
    glow:"rgba(0,200,255,.25)",
    soft:"rgba(0,200,255,.35)"
  },
  green:{
    primary:"#00ff88",
    text:"#aaffdd",
    glow:"rgba(0,255,150,.25)",
    soft:"rgba(0,255,150,.35)"
  },
  amber:{
    primary:"#ffb300",
    text:"#ffd580",
    glow:"rgba(255,179,0,.25)",
    soft:"rgba(255,179,0,.35)"
  },
  red:{
    primary:"#ff3c3c",
    text:"#ffaaaa",
    glow:"rgba(255,60,60,.25)",
    soft:"rgba(255,60,60,.35)"
  }
};

function applyTheme(name){
  const t = themes[name];
  document.documentElement.style.setProperty("--primary", t.primary);
  document.documentElement.style.setProperty("--text", t.text);
  document.documentElement.style.setProperty("--glow", t.glow);
  document.documentElement.style.setProperty("--primary-soft", t.soft);
  localStorage.setItem("terminalTheme", name);
}

if(themeSwitcher){
  themeSwitcher.addEventListener("change", e=>{
    applyTheme(e.target.value);
  });

  const savedTheme = localStorage.getItem("terminalTheme") || "blue";
  themeSwitcher.value = savedTheme;
  applyTheme(savedTheme);
}

/* ================= EVENTS ================= */

searchBtn.onclick = execute;
clearBtn.onclick  = ()=> resultDiv.innerHTML = "";

queryInput.addEventListener("keypress", e=>{
  if(e.key==="Enter") execute();
});

/* ================= MAIN EXECUTION ================= */

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

    /* PRIMARY SOURCE — WIKIPEDIA */
    const wikiRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
      { signal:controller.signal }
    );

    if(wikiRes.ok){
      const data = await wikiRes.json();
      cache.set(query,data);
      render(data);
      return;
    }

    throw new Error("Wiki failed");

  }catch{

    try{

      /* BACKUP SOURCE — DuckDuckGo Instant Answer */
      const ddgRes = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`
      );

      const ddgData = await ddgRes.json();

      if(ddgData.Abstract){
        const fallback = {
          title: query,
          extract: ddgData.Abstract,
          thumbnail: null
        };

        cache.set(query,fallback);
        render(fallback);
        return;
      }

      resultDiv.innerHTML = "No result found.";

    }catch{
      resultDiv.innerHTML = "No result found.";
    }
  }
}

/* ================= COMMAND SYSTEM ================= */

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

/* ================= RENDER ================= */

function render(data){

  const words = data.extract ? data.extract.split(" ").length : 0;
  const readingTime = Math.ceil(words/200);

  let html = `<h2>${data.title}</h2>`;
  html += `<p>${data.extract || ""}</p>`;

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

/* ================= ACTION FUNCTIONS ================= */

function copyText(){
  if(!window.currentText) return;
  navigator.clipboard.writeText(window.currentText);
}

function downloadText(title){
  if(!window.currentText) return;
  const blob = new Blob([window.currentText],{type:"text/plain"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = title + ".txt";
  a.click();
}

/* ================= IMPROVED TTS ================= */

async function speakText(){

  if(!window.currentText) return;

  try{

    const res = await fetch(
      "https://bioquiz-suggestion.killermunu.workers.dev/tts",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          text: window.currentText
        })
      }
    );

    if(!res.ok) throw new Error();

    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    audio.play();

  }catch{

    /* Fallback to browser TTS */

    speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(window.currentText);
    utter.rate = 1;
    utter.pitch = 1;
    speechSynthesis.speak(utter);
  }
}
