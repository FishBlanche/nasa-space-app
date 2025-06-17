import React, { useEffect, useState } from 'react';
import './App.css';
const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

function App() {
  const [apod, setApod] = useState(null);

  useEffect(() => {
    fetch(`${baseURL}/api/apod`)
      .then(res => res.json())
      .then(data => setApod(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="App">
      <h1>NASA Astronomy Picture of the Day</h1>
      {apod ? (
        <div>
          <h2>{apod.title}</h2>
          <img src={apod.url} alt={apod.title} style={{ maxWidth: '600px' }} />
          <p>{apod.explanation}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
