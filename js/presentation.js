document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("presentation");
  const titleEl = document.getElementById("title");
  const subtitleEl = document.getElementById("subtitle");

  // Set header
  titleEl.textContent = presentationData.title;
  subtitleEl.textContent = presentationData.subtitle || "";

  // Render slides
  presentationData.slides.forEach(slide => {
    const section = document.createElement("section");
    section.className = "slide";

    section.innerHTML = `
      <h2>${slide.heading}</h2>

      <div class="reveal-block">
        ${slide.content}
      </div>

      ${slide.image ? `<img src="${slide.image}" alt="${slide.heading}">` : ""}
    `;

    container.appendChild(section);
  });

  // Reveal logic
  document.querySelectorAll(".reveal-block").forEach(block => {
    block.addEventListener("click", () => {
      block.classList.toggle("revealed");
    });
  });
});
