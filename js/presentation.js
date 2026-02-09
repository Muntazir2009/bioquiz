let current = 0;

const container = document.getElementById("slideContainer");
const titleEl = document.getElementById("slideTitle");
const counterEl = document.getElementById("slideCounter");

function render(){
  const slide = slides[current];
  titleEl.textContent = slide.title;
  counterEl.textContent = `Slide ${current+1} / ${slides.length}`;
  container.innerHTML = `<div class="slide">${slide.content}</div>`;

  // enable click-to-unblur
  container.querySelectorAll(".blur").forEach(el=>{
    el.onclick = ()=>{
      el.classList.add("revealed");
      el.classList.remove("blur");
    };
  });
}

document.getElementById("next").onclick = ()=>{
  if(current < slides.length-1){ current++; render(); }
};

document.getElementById("prev").onclick = ()=>{
  if(current > 0){ current--; render(); }
};

render();
