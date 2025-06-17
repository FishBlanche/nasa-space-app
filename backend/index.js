
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
const PORT = 3001;

app.get('/', (req, res) => {
    res.send('Backend is working');
  });


const NASA_API_KEY = 'd6dwPKQ0wCfGguG24IZCCsp4TNDaZFpPxuLJPdX3';

app.get('/api/apod', async (req, res) => {
  try {
    console.log('→ 请求 NASA 接口:before..', NASA_API_KEY);
    const result = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`);
    console.log('→ 请求 NASA 接口:', NASA_API_KEY);
    res.json(result.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data from NASA' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
