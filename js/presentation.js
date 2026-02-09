let index = 0;

const titleEl = document.getElementById("slide-title");
const contentEl = document.getElementById("slide-content");

function render(){
  titleEl.textContent = slides[index].title;
  contentEl.textContent = slides[index].content;
}

document.getElementById("next").onclick = () => {
  if(index < slides.length - 1){
    index++;
    render();
  }
};

document.getElementById("prev").onclick = () => {
  if(index > 0){
    index--;
    render();
  }
};

render();
