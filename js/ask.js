const queryInput = document.getElementById("query");
const searchBtn = document.getElementById("searchBtn");
const resultDiv = document.getElementById("result");

searchBtn.onclick = search;
queryInput.addEventListener("keypress", e=>{
  if(e.key==="Enter") search();
});

async function search(){

  const query = queryInput.value.trim();
  if(!query) return;

  resultDiv.innerHTML = "Fetching data...\n";

  try{
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
    );

    if(!res.ok) throw new Error();

    const data = await res.json();

    displayResult(data);

  }catch{
    resultDiv.innerHTML = "No result found.\n";
  }
}

function typeWriter(text, element){
  element.innerHTML = "";
  let i = 0;
  const speed = 15;

  function type(){
    if(i < text.length){
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

function displayResult(data){

  const container = document.createElement("div");

  const text = document.createElement("div");

  const fullText = `
TITLE: ${data.title}

${data.extract}
`;

  typeWriter(fullText, text);

  container.appendChild(text);

  if(data.thumbnail){
    const img = document.createElement("img");
    img.src = data.thumbnail.source;
    container.appendChild(img);
  }

  const actionBar = document.createElement("div");
  actionBar.className = "action-bar";

  // Copy
  const copyBtn = document.createElement("button");
  copyBtn.textContent = "Copy";
  copyBtn.onclick = ()=>{
    navigator.clipboard.writeText(data.extract);
  };

  // Speak
  const speakBtn = document.createElement("button");
  speakBtn.textContent = "Speak";
  speakBtn.onclick = ()=>{
    const speech = new SpeechSynthesisUtterance(data.extract);
    speechSynthesis.speak(speech);
  };

  // Download
  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "Download";
  downloadBtn.onclick = ()=>{
    const blob = new Blob([data.extract], {type:"text/plain"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = data.title + ".txt";
    a.click();
  };

  actionBar.append(copyBtn, speakBtn, downloadBtn);

  container.appendChild(actionBar);

  resultDiv.innerHTML = "";
  resultDiv.appendChild(container);
}
