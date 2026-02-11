/* =========================================
   🌌 STAR BACKGROUND (MATCHES MAIN DESIGN)
========================================= */
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const stars = Array.from({ length: 140 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 1.4 + 0.2,
  o: Math.random() * 0.8 + 0.2,
  s: Math.random() * 0.25 + 0.05
}));

function animateStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach(star => {
    ctx.globalAlpha = star.o;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    star.y += star.s;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  });

  requestAnimationFrame(animateStars);
}
animateStars();


/* =========================================
   📥 LOAD SUGGESTIONS FROM WORKER
========================================= */

const container = document.getElementById("suggestionsContainer");

async function loadSuggestions() {

  container.innerHTML = `
    <div style="text-align:center;padding:40px 0;">
      <p style="opacity:.6;">Loading suggestions...</p>
    </div>
  `;

  try {

    const res = await fetch(
      "https://bioquiz-suggestion.killermunu.workers.dev/list"
    );

    if (!res.ok) throw new Error("Failed request");

    const data = await res.json();

    if (!data.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px 0;">
          <p style="opacity:.6;">No suggestions yet.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = "";

    data.forEach(item => {

      const card = document.createElement("div");
      card.className = "suggestion-item";

      card.innerHTML = `
        <div class="suggestion-type">${item.type}</div>
        <div class="suggestion-text">${item.suggestion}</div>
        <div class="suggestion-meta">
          ${item.name || "Anonymous"} • 
          ${new Date(item.time).toLocaleString()}
        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {

    container.innerHTML = `
      <div style="text-align:center;padding:40px 0;">
        <p style="color:#ff8a8a;">⚠ Failed to load suggestions.</p>
      </div>
    `;
  }
}

loadSuggestions();
