/* ================= DOM ================= */

const queryInput    = document.getElementById("query");
const searchBtn     = document.getElementById("searchBtn");
const clearBtn      = document.getElementById("clearBtn");
const aiBtn         = document.getElementById("aiBtn");
const resultDiv     = document.getElementById("result");
const clockEl       = document.getElementById("clock");
const themeSwitcher = document.getElementById("themeSwitcher");

/* ================= CONFIG ================= */

const AI_WORKER_URL = "https://bioquiz-ai.killermunu.workers.dev";

/* ================= STATE ================= */

let controller = null;
const cache    = new Map();
const aiCache  = new Map();
let history    = [];

/* ================= LIVE CLOCK ================= */

setInterval(() => {
  clockEl.textContent = new Date().toLocaleTimeString();
}, 1000);

/* ================= THEME SYSTEM ================= */

const themes = {
  blue:  { primary:"#00c8ff", text:"#8fdfff", glow:"rgba(0,200,255,.25)", soft:"rgba(0,200,255,.35)" },
  green: { primary:"#00ff88", text:"#aaffdd", glow:"rgba(0,255,150,.25)", soft:"rgba(0,255,150,.35)" },
  amber: { primary:"#ffb300", text:"#ffd580", glow:"rgba(255,179,0,.25)", soft:"rgba(255,179,0,.35)" },
  red:   { primary:"#ff3c3c", text:"#ffaaaa", glow:"rgba(255,60,60,.25)", soft:"rgba(255,60,60,.35)" }
};

function applyTheme(name) {
  const t = themes[name] || themes.blue;
  document.documentElement.style.setProperty("--primary",      t.primary);
  document.documentElement.style.setProperty("--text",         t.text);
  document.documentElement.style.setProperty("--glow",         t.glow);
  document.documentElement.style.setProperty("--primary-soft", t.soft);
  localStorage.setItem("terminalTheme", name);
}

if (themeSwitcher) {
  themeSwitcher.addEventListener("change", e => applyTheme(e.target.value));
  const savedTheme = localStorage.getItem("terminalTheme") || "blue";
  themeSwitcher.value = savedTheme;
  applyTheme(savedTheme);
}

/* ================= BUTTON EVENTS ================= */

searchBtn.addEventListener("click", execute);
clearBtn.addEventListener("click",  () => { resultDiv.innerHTML = ""; });
if (aiBtn) aiBtn.addEventListener("click", executeAI);

queryInput.addEventListener("keypress", e => {
  if (e.key === "Enter") execute();
});

/* ================= WIKIPEDIA SEARCH ================= */

async function execute() {
  const query = queryInput.value.trim();
  if (!query) return;

  if (handleCommand(query)) return;

  history.push(query);

  if (cache.has(query)) { render(cache.get(query)); return; }

  if (controller) controller.abort();
  controller = new AbortController();

  resultDiv.innerHTML = `<div class="loading">Processing query...</div>`;

  try {
    const wikiRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
      { signal: controller.signal }
    );

    if (wikiRes.ok) {
      const data = await wikiRes.json();
      cache.set(query, data);
      render(data);
      return;
    }
    throw new Error("Wiki failed");

  } catch(err) {
    if (err.name === "AbortError") return;

    try {
      const ddgRes  = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
      const ddgData = await ddgRes.json();

      if (ddgData.Abstract) {
        const fallback = { title: query, extract: ddgData.Abstract, thumbnail: null };
        cache.set(query, fallback);
        render(fallback);
        return;
      }
      resultDiv.innerHTML = "No result found. Try ASK AI instead.";

    } catch {
      resultDiv.innerHTML = "No result found.";
    }
  }
}

/* ================= CLOUDFLARE AI ================= */

async function executeAI() {
  const query = queryInput.value.trim();
  if (!query) return;

  /* Remove previous AI block if present */
  const existing = resultDiv.querySelector(".ai-block");
  if (existing) existing.remove();

  /* Add a header if result area is blank */
  if (!resultDiv.querySelector("h2")) {
    resultDiv.innerHTML = `<h2 style="color:var(--accent);margin:0 0 10px">${escapeHtml(query)}</h2>`;
  }

  /* Build AI block */
  const aiBlock = document.createElement("div");
  aiBlock.className = "ai-block";
  aiBlock.innerHTML = `
    <div class="ai-label">▸ AI INTELLIGENCE</div>
    <div class="ai-text" id="aiText"><span class="ai-cursor"></span></div>
  `;
  resultDiv.appendChild(aiBlock);
  aiBlock.scrollIntoView({ behavior: "smooth", block: "nearest" });

  const aiTextEl = document.getElementById("aiText");

  /* Serve from cache if available */
  if (aiCache.has(query)) {
    typewriter(aiTextEl, aiCache.get(query), () => appendAIActions(aiBlock, query));
    return;
  }

  aiBtn.disabled    = true;
  aiBtn.textContent = "THINKING...";

  try {
    const res = await fetch(https://bioquiz-ai.killermunu.workers.dev, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ query })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    aiCache.set(query, data.answer);
    typewriter(aiTextEl, data.answer, () => appendAIActions(aiBlock, query));

  } catch(err) {
    aiTextEl.innerHTML = `<span style="color:#ff8a8a">AI request failed: ${err.message}</span>`;
  } finally {
    aiBtn.disabled    = false;
    aiBtn.textContent = "ASK AI";
  }
}

/* ── Typewriter effect ── */
function typewriter(el, text, onComplete) {
  el.innerHTML = '<span class="ai-cursor"></span>';
  let i = 0;
  const cursor = el.querySelector(".ai-cursor");
  const iv = setInterval(() => {
    if (i < text.length) {
      cursor.insertAdjacentText("beforebegin", text[i++]);
    } else {
      clearInterval(iv);
      cursor.remove();
      if (onComplete) onComplete();
    }
  }, 18);
}

/* ── AI action buttons ── */
function appendAIActions(block, title) {
  window.currentAIText = aiCache.get(title) || "";
  const bar = document.createElement("div");
  bar.className = "action-bar";
  bar.style.marginTop = "16px";
  bar.innerHTML = `
    <button onclick="copyAI()">Copy AI Answer</button>
    <button onclick="speakContent(window.currentAIText)">Speak AI Answer</button>
    <button onclick="downloadAI()">Download</button>
  `;
  block.appendChild(bar);
}

function copyAI() {
  if (window.currentAIText) navigator.clipboard.writeText(window.currentAIText);
}

function downloadAI() {
  if (!window.currentAIText) return;
  const a = document.createElement("a");
  a.href     = URL.createObjectURL(new Blob([window.currentAIText], { type: "text/plain" }));
  a.download = "ai-answer.txt";
  a.click();
}

/* ================= COMMAND SYSTEM ================= */

function handleCommand(cmd) {
  cmd = cmd.toLowerCase();
  if (cmd === "clear")   { resultDiv.innerHTML = ""; return true; }
  if (cmd === "history") { resultDiv.innerHTML = history.map(h => `> ${h}`).join("<br>"); return true; }
  if (cmd === "help")    { resultDiv.innerHTML = "Commands: help &nbsp; clear &nbsp; history &nbsp; about"; return true; }
  if (cmd === "about")   { resultDiv.innerHTML = "Mission Intelligence Panel v4.0 — Cloudflare AI powered"; return true; }
  return false;
}

/* ================= RENDER ================= */

function render(data) {
  const words       = data.extract ? data.extract.split(" ").length : 0;
  const readingTime = Math.ceil(words / 200);

  /* ✅ FIX: store title safely, never inject it into onclick strings */
  window.currentTitle = data.title || "";
  window.currentText  = data.extract || "";

  let html = `<h2>${escapeHtml(data.title)}</h2>`;
  html    += `<p>${data.extract || ""}</p>`;

  if (data.thumbnail) {
    html += `<img src="${data.thumbnail.source}" alt="${escapeHtml(data.title)}">`;
  }

  html += `<div class="meta">Words: ${words} | Reading time: ${readingTime} min</div>`;

  html += `
    <div class="action-bar">
      <button onclick="copyText()">Copy</button>
      <button onclick="speakContent(window.currentText)">Speak</button>
      <button onclick="downloadText()">Download</button>
      <button onclick="openWiki()">Full Article</button>
    </div>
  `;

  resultDiv.innerHTML = html;
}

/* ================= WIKIPEDIA ACTIONS ================= */

function copyText() {
  if (window.currentText) navigator.clipboard.writeText(window.currentText);
}

function downloadText() {
  if (!window.currentText) return;
  const a = document.createElement("a");
  a.href     = URL.createObjectURL(new Blob([window.currentText], { type: "text/plain" }));
  a.download = (window.currentTitle || "result") + ".txt";
  a.click();
}

function openWiki() {
  if (window.currentTitle) {
    window.open(`https://en.wikipedia.org/wiki/${encodeURIComponent(window.currentTitle)}`, "_blank");
  }
}

/* ================= SHARED TTS ================= */

function speakContent(text) {
  if (!text) return;
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);

  function pickBestVoice() {
    const v = speechSynthesis.getVoices();
    return (
      v.find(x => x.name.toLowerCase().includes("microsoft") && x.name.toLowerCase().includes("neural")) ||
      v.find(x => x.name.toLowerCase().includes("google") && x.lang.startsWith("en")) ||
      v.find(x => x.lang.startsWith("en")) ||
      v[0]
    );
  }

  function applyVoice() {
    const voice = pickBestVoice();
    if (voice) utter.voice = voice;
    utter.rate = 0.95; utter.pitch = 1; utter.volume = 1;
    speechSynthesis.speak(utter);
  }

  speechSynthesis.getVoices().length === 0
    ? (speechSynthesis.onvoiceschanged = applyVoice)
    : applyVoice();
}

/* ================= UTIL ================= */

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
