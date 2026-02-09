let index = 0;

const title = document.getElementById("title");
const points = document.getElementById("points");
const image = document.getElementById("image");

function render(){
  const slide = slides[index];
  title.textContent = slide.title;

  points.innerHTML = "";
  slide.points.forEach(p=>{
    const li = document.createElement("li");
    li.textContent = p;
    points.appendChild(li);
  });

  image.src = slide.image || "";
}

document.getElementById("next").onclick = ()=>{
  if(index < slides.length-1) index++;
  render();
};

document.getElementById("prev").onclick = ()=>{
  if(index > 0) index--;
  render();
};

document.addEventListener("keydown", e=>{
  if(e.key === "ArrowRight") document.getElementById("next").click();
  if(e.key === "ArrowLeft") document.getElementById("prev").click();
});

render();
