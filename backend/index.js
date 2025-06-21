
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.send('Backend is working');
  });


const NASA_API_KEY = process.env.NASA_API_KEY || 'd6dwPKQ0wCfGguG24IZCCsp4TNDaZFpPxuLJPdX3';

app.get('/api/apod', async (req, res) => {
  const { date } = req.query;

  const nasaUrl = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}${
    date ? `&date=${date}` : ''
  }`;

  try {
    const response = await axios.get(nasaUrl);
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching APOD:', err.response?.data || err.message);
    res.status(500).json(err.response?.data);
  }
});

// 🚀 GET /api/apod/recent  
app.get('/api/apod/recent', async (req, res) => {
  const today = new Date();
  const dates = [...Array(30)].map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  try {
    const results = await Promise.all(
      dates.map(date =>
        axios.get(
          `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${date}`
        )
      )
    );

    // 返回的数据格式
    const trendData = results.map(r => ({
      date: r.data.date,
      type: r.data.media_type,
      views: Math.floor(Math.random() * 100) + 20,    
    }));

    res.json(trendData.reverse());  
  } catch (err) {
    console.error('Error fetching recent APOD:', err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
