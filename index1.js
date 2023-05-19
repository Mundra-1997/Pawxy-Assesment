const cxId = "06642f791a21e4a0b"; 
const apiKey = "AIzaSyA0vBsy8CYhX_9Dk4JejeEiSPBR6yF_IRY";
const resultsPerPage = 10;
let currentPage = 1;
let totalResults = 0;
let currentQuery = "";


const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const resultsList = document.getElementById("results-list");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const previewOverlay = document.getElementById("preview-overlay");
const previewContent = document.getElementById("preview-content");
const visitButton = document.getElementById("visit-button");
const closeButton = document.getElementById("close-button");


searchButton.addEventListener("click", handleSearch);
prevButton.addEventListener("click", handlePrevPage);
nextButton.addEventListener("click", handleNextPage);
window.addEventListener("scroll", handleScroll, { passive: true });


function handleSearch() {
  const query = searchInput.value.trim();
  if (query !== "") {
    currentQuery = query;
    currentPage = 1;
    searchVideos();
  }
}


function handlePrevPage() {
  if (currentPage > 1) {
    currentPage--;
    searchVideos();
  }
}


function handleNextPage() {
  const maxPages = Math.ceil(totalResults / resultsPerPage);
  if (currentPage < maxPages) {
    currentPage++;
    searchVideos();
  }
}


function searchVideos() {
  const startIndex = (currentPage - 1) * resultsPerPage + 1;
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cxId}&q=${encodeURIComponent(
    currentQuery
  )}&start=${startIndex}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
      totalResults = parseInt(data.searchInformation.totalResults, 10);
      displayResults(data.items);
      updatePagination();
    })
    .catch((error) => console.log(error));
}

async function fetchVideoDetails(link) {
  const url = new URL(link);
  const searchParams = new URLSearchParams(url.search);
  const id = searchParams.get("v");
  const videoIdParam = id;
  const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIdParam}&key=${apiKey}`;

  try {
    const response = await fetch(videoUrl);
    const data = await response.json();

    if (data.hasOwnProperty('items') && data.items.length > 0) {
      const item = data.items[0];
      const videoId = item.id;
      const title = item.snippet.title;
      const thumbnail = item.snippet.thumbnails.default.url;
      const views = item.statistics.viewCount;
      const popularity = calculatePopularity(views);

      return { videoId, title, thumbnail, views, popularity };
    } else {
      console.log('Invalid API response');
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
}


function calculatePopularity(views) {
  if (views < 1000) {
    return "Low";
  } else if (views < 10000) {
    return "Medium";
  } else {
    return "High";
  }
}






function displayResults(items) {
  resultsList.innerHTML = "";

  items.forEach((item) => {
    console.log(item);
    
    
      fetchVideoDetails(item.link)
      .then((videoDetails) => {
        if (videoDetails) {
          const { videoId, title, thumbnail, views, popularity } = videoDetails;
          const div = document.createElement("div");
          console.log(videoId, title, thumbnail, views, popularity);
           div.classList = "each-search";
           div.innerHTML = `
      <img src="${thumbnail}" alt="${title}" />
      <h3>${title}</h3>
      <p>Views: ${views}</p>
      <p>Popularity: ${popularity}</p>
    `;
         
    div.addEventListener("click", () => getYouTubeVideoId(item.link));
    resultsList.appendChild(div);
        }
      })
      .catch((error) => console.log(error));
   
  });
}
// const headers = new Headers();
// headers.append('Permissions-Policy', 'ch-ua-form-factor=(), fullscreen=(self)');


function getYouTubeVideoId(link) {
    console.log(link);
  const url = new URL(link);
  const searchParams = new URLSearchParams(url.search);
  const id = searchParams.get("v=");
  openPreview(id,link);
}



function updatePagination() {
  const maxPages = Math.ceil(totalResults / resultsPerPage);
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === maxPages || maxPages === 0;
}

function openPreview(id,link) {
  previewContent.innerHTML = `
    <iframe width="560" height="315" src= "https://www.youtube.com/embed/${id}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
    <div>
      <button id="visit-button">Visit</button>
      <button id="close-button">Close</button>
    </div>
  `;
  previewOverlay.style.display = "flex";

  const visitButton = document.getElementById("visit-button");
  visitButton.addEventListener("click", () => visitVideo(link));

  const closeButton = document.getElementById("close-button");
  closeButton.addEventListener("click", closePreview);
}


function visitVideo(videoLink) {
  window.open(videoLink, "_blank");
  closePreview();
}


function closePreview() {
  previewOverlay.style.display = "none";
}


function init() {
  searchInput.value = "";
  searchInput.focus();
}


init();