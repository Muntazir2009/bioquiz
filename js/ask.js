const searchBtn = document.getElementById("searchBtn");
const queryInput = document.getElementById("query");
const resultDiv = document.getElementById("result");

searchBtn.addEventListener("click", search);
queryInput.addEventListener("keypress", e => {
  if(e.key === "Enter") search();
});

async function search(){

  const query = queryInput.value.trim();
  if(!query) return;

  resultDiv.innerHTML = `<div class="loading">Searching...</div>`;

  try{

    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
    );

    if(!res.ok) throw new Error();

    const data = await res.json();

    resultDiv.innerHTML = `
      <div class="card">
        ${data.thumbnail ? `<img src="${data.thumbnail.source}">` : ""}
        <h2>${data.title}</h2>
        <p>${data.extract}</p>
        <br>
        <a href="${data.content_urls.desktop.page}" target="_blank">
          Read full article →
        </a>
      </div>
    `;

  }catch(err){
    resultDiv.innerHTML = `
      <div class="card">
        <p>No result found. Try another topic.</p>
      </div>
    `;
  }
}
