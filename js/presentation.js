document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".reveal-block").forEach(block => {
    block.addEventListener("click", () => {
      block.classList.toggle("revealed");
    });
  });
});
