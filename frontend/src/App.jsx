import { useEffect, useState } from 'react';
import axios from 'axios';
const backendURL = import.meta.env.VITE_APP_BACKEND_URL ;

function App() {
  const [apodData, setApodData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchAPOD = async (date = '') => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${backendURL}/api/apod${date ? `?date=${date}` : ''}`);
      setApodData(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data from NASA API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAPOD(); // load today's APOD on mount
  }, []);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchAPOD(newDate);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-6 text-center">🌌 NASA Astronomy Picture of the Day</h1>

      <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
        <label className="text-lg">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
          max={new Date().toISOString().split('T')[0]} // max = today
        />
      </div>

      {loading && <p className="text-xl animate-pulse">Loading...</p>}

      {error && (
        <p className="text-red-400 text-lg">{error}</p>
      )}

      {apodData && (
        <div className="max-w-3xl w-full bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-2">{apodData.title}</h2>
          <p className="text-sm text-gray-400 mb-4">{apodData.date}</p>

          {apodData.media_type === 'image' ? (
            <img
              src={apodData.url}
              alt={apodData.title}
              className="rounded mb-4 w-full object-cover"
            />
          ) : (
            <iframe
              src={apodData.url}
              title={apodData.title}
              className="w-full h-64 mb-4 rounded"
              frameBorder="0"
              allow="encrypted-media"
              allowFullScreen
            ></iframe>
          )}

          <p className="text-gray-300 leading-relaxed">{apodData.explanation}</p>
        </div>
      )}
    </div>
  );
}

export default App;
