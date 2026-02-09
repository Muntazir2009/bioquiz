let currentSlide = 0;

const slideContainer = document.getElementById("slide");
const titleEl = document.getElementById("slideTitle");
const counterEl = document.getElementById("slideCounter");
const progressFill = document.getElementById("progressFill");

const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

function renderSlide(){
  const slide = slides[currentSlide];

  // inject content
  titleEl.textContent = slide.title;
  slideContainer.innerHTML = slide.content;
  counterEl.textContent = `Slide ${currentSlide + 1} / ${slides.length}`;

  // progress bar
  progressFill.style.width = `${((currentSlide + 1) / slides.length) * 100}%`;

  // 🔥 THIS IS THE FIX
  attachRevealHandlers();
}

function attachRevealHandlers(){
  const blocks = slideContainer.querySelectorAll(".reveal-block");

  blocks.forEach(block=>{
    block.addEventListener("click", ()=>{
      block.classList.add("revealed");
    });
  });
}

prevBtn.onclick = ()=>{
  if(currentSlide > 0){
    currentSlide--;
    renderSlide();
  }
};

nextBtn.onclick = ()=>{
  if(currentSlide < slides.length - 1){
    currentSlide++;
    renderSlide();
  }
};

// initial load
renderSlide();
