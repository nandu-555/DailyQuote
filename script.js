let currentQuote = null;

function fetchNewQuote() {
  fetch('https://quote-api.onrender.com/qotd')
    .then(response => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then(data => {
      const quote = data.quote;
      currentQuote = quote;

      document.getElementById('quote-text').innerText = `"${quote.body}"`;
      document.getElementById('quote-author').innerText = `– ${quote.author}`;
    })
    .catch(error => {
      console.error("Error fetching new quote:", error);
      document.getElementById('quote-text').innerText = 'Could not load quote.';
    });
}

window.onload = () => {
  fetchNewQuote();
};

// Search quotes by keyword
function searchQuote() {
  const keyword = document.getElementById('search-input').value;
  if (!keyword) return;

  fetch(`https://quote-api.onrender.com/search?q=${keyword}`)

    .then(res => res.json())
    .then(data => {
      const resultsDiv = document.getElementById('search-results');
      resultsDiv.innerHTML = `<h2 class="text-xl font-semibold text-blue-800 mb-4">Results for "${keyword}"</h2>`;

      if (data.quotes.length === 0) {
        resultsDiv.innerHTML += '<p class="text-red-600">No quotes found.</p>';
        return;
      }

      data.quotes.forEach(quote => {
        const quoteElem = document.createElement('div');
        quoteElem.className = "bg-white p-4 mb-4 rounded-lg shadow border-l-4 border-blue-400";

        const quoteText = `"${quote.body}"`;
        const author = `– ${quote.author}`;

        quoteElem.innerHTML = `
          <blockquote class="text-gray-700 italic text-lg">${quoteText}</blockquote>
          <p class="text-right text-blue-600 mt-2 font-medium">${author}</p>
          <div class="flex justify-end gap-4 mt-2 text-sm">
            <button class="text-blue-600 hover:underline" onclick="copyQuote(\`${quoteText} ${author}\`)">📋 Copy</button>
            <button class="text-yellow-500 hover:underline" onclick='saveFavorite(${JSON.stringify(quote)})'>⭐ Save</button>
            <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(quoteText + ' ' + author)}" 
               target="_blank" class="text-sky-500 hover:underline">🐦 Tweet</a>
          </div>
        `;

        resultsDiv.appendChild(quoteElem);
      });
    })
    .catch(error => {
      console.error(error);
      alert('Failed to fetch quotes.');
    });
}


// Copy quote to clipboard
function copyQuote(text) {
  navigator.clipboard.writeText(text)
    .then(() => alert("Quote copied to clipboard!"))
    .catch(err => alert("Failed to copy quote."));
}


// Save quote to localStorage
function saveFavorite(quote) {
  let favorites = JSON.parse(localStorage.getItem("favoriteQuotes")) || [];
  favorites.push(quote);
  localStorage.setItem("favoriteQuotes", JSON.stringify(favorites));
  alert("Quote saved to favorites!");
}

function loadFavorites() {
  const favContainer = document.getElementById('favorites-list');
  favContainer.innerHTML = ''; // Clear old content

  const favorites = JSON.parse(localStorage.getItem("favoriteQuotes")) || [];

  if (favorites.length === 0) {
    favContainer.innerHTML = '<p class="text-gray-500">No favorites saved yet.</p>';
    return;
  }

  favorites.forEach((quote, index) => {
    const favElem = document.createElement('div');
    favElem.className = "bg-yellow-50 p-4 mb-4 rounded-lg shadow border-l-4 border-yellow-400";

    favElem.innerHTML = `
      <blockquote class="text-gray-800 italic text-lg">"${quote.body}"</blockquote>
      <p class="text-right text-green-700 mt-2 font-medium">– ${quote.author}</p>
      <div class="text-right mt-2">
        <button onclick="removeFavorite(${index})" class="text-red-500 hover:underline">🗑 Remove</button>
      </div>
    `;

    favContainer.appendChild(favElem);
  });
}

function removeFavorite(index) {
  let favorites = JSON.parse(localStorage.getItem("favoriteQuotes")) || [];
  favorites.splice(index, 1);
  localStorage.setItem("favoriteQuotes", JSON.stringify(favorites));
  loadFavorites(); // Refresh view
}

function copyCurrentQuote() {
  if (!currentQuote) return;
  const text = `"${currentQuote.body}" – ${currentQuote.author}`;
  navigator.clipboard.writeText(text)
    .then(() => alert("Quote copied to clipboard!"));
}

function saveCurrentQuote() {
  if (!currentQuote) return;
  let favorites = JSON.parse(localStorage.getItem("favoriteQuotes")) || [];
  favorites.push(currentQuote);
  localStorage.setItem("favoriteQuotes", JSON.stringify(favorites));
  alert("Quote saved to favorites!");
}


function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  // Save preference
  localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
}

// Load user dark mode preference
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark');
  }
});


function generateQuoteImage() {
  if (!currentQuote) return;

  const canvas = document.getElementById('quote-canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas size
  canvas.width = 800;
  canvas.height = 400;
  canvas.classList.remove('hidden');

  // Background
  ctx.fillStyle = "#fef3c7"; // soft yellow
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Quote text
  ctx.fillStyle = "#1f2937"; // dark gray
  ctx.font = "24px Georgia";
  wrapText(ctx, `"${currentQuote.body}"`, 40, 80, 720, 30);

  // Author
  ctx.font = "20px Arial";
  ctx.fillStyle = "#4b5563"; // soft dark
  ctx.fillText(`– ${currentQuote.author}`, 500, 340);

  // Download link
  const dataURL = canvas.toDataURL("image/png");
  const link = document.getElementById('download-link');
  link.href = dataURL;
  link.classList.remove('hidden');
}

// Helper to wrap text in canvas
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

async function generateImageForQuote(text) {
  if (!text) {
    console.error("Missing quote text for image generation");
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/generate-image?q=${encodeURIComponent(text)}`);
    const data = await response.json();

    if (data.imageUrl) {
      const imageDiv = document.getElementById("quote-image");
      imageDiv.innerHTML = `<img src="${data.imageUrl}" alt="Generated Image" style="max-width:100%; margin-top:20px;">`;
    } else {
      console.error("No image found for prompt");
    }
  } catch (err) {
    console.error("Error generating image:", err);
  }
}

function generateImageForCurrentQuote() {
  const quoteText = document.getElementById("quote-text").textContent;
  generateImageForQuote(quoteText);
}

generateImageBtn.addEventListener('click', async () => {
  const quoteText = quoteTextElement.innerText;

  try {
    const response = await fetch(`/generate-image?query=${encodeURIComponent(quoteText)}`);
    const data = await response.json();

    if (data.imageUrl) {
      imageElement.src = data.imageUrl;
    } else {
      imageElement.alt = "No image found.";
    }
  } catch (error) {
    console.error("Image generation error:", error);
  }
});

function nextQuoteWithAnimation() {
  const quoteBox = document.getElementById("quote-box");

  // Add animation class
  quoteBox.classList.add("page-flip");

  // After animation, fetch new quote
  setTimeout(() => {
    quoteBox.classList.remove("page-flip");
    fetchNewQuote(); // Now correctly loads a new quote
  }, 600);
}




