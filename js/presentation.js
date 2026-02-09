const titleEl = document.getElementById("title");
const contentEl = document.getElementById("content");
const counterEl = document.getElementById("counter");

const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const revealBtn = document.getElementById("reveal");

let index = 0;

function render(){
  const slide = slides[index];
  titleEl.textContent = slide.title;
  contentEl.textContent = slide.content;

  contentEl.classList.add("blurred");
  contentEl.classList.remove("revealed");

  counterEl.textContent = `${index + 1} / ${slides.length}`;
}

prevBtn.onclick = () => {
  if(index > 0){
    index--;
    render();
  }
};

nextBtn.onclick = () => {
  if(index < slides.length - 1){
    index++;
    render();
  }
};

revealBtn.onclick = () => {
  contentEl.classList.remove("blurred");
  contentEl.classList.add("revealed");
};

/* ⌨️ KEYBOARD SUPPORT */
document.addEventListener("keydown", e => {
  if(e.key === "ArrowRight") nextBtn.click();
  if(e.key === "ArrowLeft") prevBtn.click();
  if(e.key === " ") revealBtn.click();
});

/* INIT */
render();
