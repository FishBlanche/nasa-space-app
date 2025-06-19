
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
    try {
        const date = req.query.date;
        const nasaUrl = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}${date ? `&date=${date}` : ''}`;
    
        console.log('📡 Fetching:', nasaUrl);
    
        const result = await axios.get(nasaUrl);
        res.json(result.data);
      } catch (err) {
        console.error('❌ NASA API Error:', err.response?.status, err.response?.data || err.message);
        res.status(err.response?.status || 500).json({ error: 'Failed to fetch data from NASA' });
      }
});

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
        axios.get(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${date}`)
      )
    );

    const trendData = results.map(r => ({
      date: r.data.date,
      type: r.data.media_type,
    }));

    res.json(trendData.reverse()); // old -> new
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recent data' });
  }
});


app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
