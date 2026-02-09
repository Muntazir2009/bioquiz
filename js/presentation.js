const slideEl = document.getElementById("slide");
const countEl = document.getElementById("slideCount");
const progressFill = document.getElementById("progressFill");

let current = 0;

function render(){
  const s = slides[current];
  slideEl.innerHTML = s.content;
  countEl.textContent = `Slide ${current+1} / ${slides.length}`;
  progressFill.style.width = ((current+1)/slides.length)*100 + "%";

  slideEl.querySelectorAll(".blur").forEach(el=>{
    el.onclick = ()=>el.classList.add("reveal");
  });
}

document.getElementById("next").onclick = ()=>{
  if(current < slides.length-1){ current++; render(); }
};

document.getElementById("prev").onclick = ()=>{
  if(current > 0){ current--; render(); }
};

document.addEventListener("keydown",e=>{
  if(e.key==="ArrowRight") document.getElementById("next").click();
  if(e.key==="ArrowLeft") document.getElementById("prev").click();
});

render();
