import { useEffect, useState, useCallback, useMemo, Suspense, lazy } from 'react';
import axios from 'axios';

const LineChart = lazy(() => import('./components/LineChart'));

const backendURL = import.meta.env.VITE_APP_BACKEND_URL;

const App = () => {
  const [apodData, setApodData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [activeTab, setActiveTab] = useState('image');
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [trendData, setTrendData] = useState([]);

  const fetchAPOD = useCallback(async (date = '') => {
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
  }, []);

  useEffect(() => {
    fetchAPOD();
  }, [fetchAPOD]);

  const handleDateChange = useCallback((e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchAPOD(newDate);
  }, [fetchAPOD]);

  const handleAIExplain = useCallback(async () => {
    if (!apodData) return;
    setAiLoading(true);
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: `Summarize this NASA APOD in 1 short sentence:\n\n"${apodData.explanation}"`,
            },
          ],
          temperature: 0.7,
          max_tokens: 100,
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
        }
      );

      const aiText = response.data.choices[0].message.content.trim();
      setAiSummary(aiText);
    } catch (err) {
      console.error(err);
      setAiSummary('AI failed to summarize.');
    } finally {
      setAiLoading(false);
    }
  }, [apodData]);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const response = await axios.get(`${backendURL}/api/apod/recent`);
        setTrendData(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTrend();
  }, []);

  const lineChartData = useMemo(() => {
    return {
      labels: trendData.map(item => item.date),
      datasets: [
        {
          label: 'Media Type (1=image, 0=video)',
          data: trendData.map(item => (item.type === 'image' ? 1 : 0)),
          borderColor: '#3b82f6',
          backgroundColor: '#3b82f6',
        },
      ],
    };
  }, [trendData]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6 space-y-6">
      <h1 className="text-4xl font-bold text-center">🌌 NASA Astronomy Picture of the Day</h1>
      <div className="max-w-3xl w-full mx-auto">

      <div className=" flex justify-center space-x-4 mt-4">
        <button
          onClick={() => setActiveTab('image')}
          className={`px-4 py-2 rounded ${activeTab === 'image' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Image
        </button>
        <button
          onClick={() => setActiveTab('chart')}
          className={`px-4 py-2 rounded ${activeTab === 'chart' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Chart
        </button>
      </div>
</div>
      {loading && <p className="text-xl animate-pulse mt-4">Loading...</p>}

      {error && <p className="text-red-400 text-lg mt-4">{error}</p>}

      {activeTab === 'image' && apodData && !loading && (
        <div className="max-w-3xl w-full bg-gray-800 p-6 rounded-lg shadow-lg mt-4">
          {/* 日期选择器放到 image tab 里 */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <label className="text-lg">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <h2 className="text-2xl font-semibold mb-2">{apodData.title}</h2>
          <p className="text-sm text-gray-400 mb-4">{apodData.date}</p>

          {apodData.media_type === 'image' ? (
            <img
              src={apodData.url}
              alt={apodData.title}
              className="rounded mb-4 w-full object-cover"
              loading="lazy"
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

          <div className="flex space-x-4 mb-4">
            <button
              onClick={handleAIExplain}
              className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700"
              disabled={aiLoading}
            >
              {aiLoading ? 'Generating AI Summary...' : 'AI Explain'}
            </button>
          </div>

          {aiSummary && (
            <div className="bg-gray-700 p-4 rounded text-sm text-blue-300 mb-4">
              💡 AI Summary: {aiSummary}
            </div>
          )}

          <p className="text-gray-300 leading-relaxed">{apodData.explanation}</p>
        </div>
      )}

      {activeTab === 'chart' && (
        <div className="max-w-xl w-full bg-gray-800 p-6 rounded-lg shadow-lg mt-4">
          <h2 className="text-2xl font-semibold mb-4">Media Type Trend (Last 30 Days)</h2>
          <Suspense fallback={<p className="text-center">Loading chart...</p>}>
            <LineChart data={lineChartData} />
          </Suspense>
        </div>
      )}

      <footer className="mt-10 text-gray-500 text-sm">
        Built with React + Vite + Tailwind + Chart.js | NASA Open API
      </footer>
    </div>
  );
};

export default App;
