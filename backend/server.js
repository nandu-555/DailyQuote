import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000;

const API_KEY = '79762e08b21563ce0cf6194fe3534053'; // Your FavQs API key
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY; // Add this to your .env file

app.use(cors());
app.use(express.json()); // Needed for POST JSON body

// 🔹 Quote of the Day
app.get('/qotd', async (req, res) => {
  try {
    const response = await fetch('https://favqs.com/api/qotd');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quote of the day' });
  }
});

// 🔹 Search Quotes
app.get('/search', async (req, res) => {
  const keyword = req.query.q;
  if (!keyword) {
    return res.status(400).json({ error: 'Missing search keyword' });
  }

  try {
    const response = await fetch(`https://favqs.com/api/quotes/?filter=${encodeURIComponent(keyword)}`, {
      headers: {
        'Authorization': `Token token="${API_KEY}"`
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});


// New route for generating an image
app.get('/generate-image', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Missing query for image generation' });
  }

  try {
    const response = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}`);
    const data = await response.json();
    
    if (data && data.urls && data.urls.regular) {
      res.json({ imageUrl: data.urls.regular });
    } else {
      res.status(500).json({ error: 'Image not found' });
    }
  } catch (error) {
    console.error("Image fetch error:", error);
    res.status(500).json({ error: 'Image fetch failed' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
