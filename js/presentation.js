document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".reveal").forEach(block => {
    block.addEventListener("click", () => {
      block.classList.toggle("revealed");
    });
  });
});
