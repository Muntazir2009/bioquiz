document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("presentation");

  presentationData.slides.forEach(slide => {
    const section = document.createElement("section");
    section.className = "slide";

    section.innerHTML = `
      <h2>${slide.heading}</h2>
      ${slide.content}
    `;

    container.appendChild(section);
  });

  document.querySelectorAll(".reveal-block").forEach(block => {
    block.addEventListener("click", () => {
      block.classList.toggle("revealed");
    });
  });
});
