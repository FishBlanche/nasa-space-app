import { useState, lazy,Suspense,useCallback,useEffect,useMemo } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import axios from "axios"
 
// 👉 懒加载 LineChart
const LineChart = lazy(() => import("./components/LineChart"));

const backendURL = import.meta.env.VITE_APP_BACKEND_URL;
//const backendURL = process.env.VITE_APP_BACKEND_URL;
 
function App() {
  const [apodData, setApodData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [recentData, setRecentData] = useState([]);

  // 🔸 fetch APOD (single)
  const fetchAPOD = useCallback(async (date = "") => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${backendURL}/api/apod${date ? `?date=${date}` : ""}`);
      setApodData(response.data);
    } catch (err) {
   //   console.error('error is..',err);
      setError(err.response.data.msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔸 fetch Recent for Chart
  const fetchRecentData = useCallback(async () => {
    try {
      const response = await axios.get(`${backendURL}/api/apod/recent`);
      setRecentData(response.data);
    } catch (err) {
      console.error("Failed to fetch recent data.");
    }
  }, []);

  useEffect(() => {
    fetchAPOD();
    fetchRecentData();
  }, [fetchAPOD, fetchRecentData]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleFetchByDate = () => {
    if (selectedDate) {
      fetchAPOD(selectedDate);
    }
  };

  const formattedChartData = useMemo(() => {
    if (!recentData.length) return [];
    return recentData.map((item) => ({
      date: item.date,
      views: item.views || Math.floor(Math.random() * 100), // fallback if no views
    }));
  }, [recentData]);

  return (
    <div className="min-h-screen w-full  flex flex-col">
    {/* Header */}
    <header className="w-full max-w-4xl mx-auto flex flex-col items-center py-6 px-4">
      <h1 className="w-full text-4xl font-bold text-center mb-4">
        NASA Astronomy Picture of the Day
      </h1>
      <Separator className="w-full" />
    </header>

    {/* Main */}
    <main className="flex-1 w-full flex flex-col items-center px-4">
      <div className="w-full max-w-5xl flex flex-col flex-grow">
        <Tabs defaultValue="image" className="flex flex-col flex-grow">
          <TabsList className="flex justify-center mb-6">
            <TabsTrigger value="image">Image</TabsTrigger>
            <TabsTrigger value="chart">Chart</TabsTrigger>
          </TabsList>

          {/* Image tab */}
          <TabsContent
            value="image"
            className="flex flex-col space-y-4 flex-grow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
              <Label htmlFor="date" className="whitespace-nowrap">
                Select Date:
              </Label>

              {/* DatePicker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[200px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(new Date(selectedDate), "yyyy-MM-dd")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      selectedDate ? new Date(selectedDate) : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        const isoDate = format(date, "yyyy-MM-dd")
                        handleDateChange({ target: { value: isoDate } })
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Fetch button */}
              <Button onClick={handleFetchByDate}>Fetch</Button>
            </div>

            {loading ? (
              <Skeleton className="w-full h-96 rounded-lg " />
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : apodData ? (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-center mb-2">
                    {apodData.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {apodData.media_type === "image" ? (
                    <img
                      src={apodData.url}
                      alt={apodData.title}
                      className="w-full rounded-lg mb-4"
                    />
                  ) : (
                    <iframe
                      src={apodData.url}
                      title={apodData.title}
                      className="w-full h-96 rounded-lg mb-4"
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    ></iframe>
                  )}
                  <p>{apodData.explanation}</p>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>

          {/* Chart tab */}
          <TabsContent
            value="chart"
            className="flex flex-col space-y-4 flex-grow"
          >
            <Card className="w-full">
              <CardHeader>
                <CardTitle>API Usage Over Time</CardTitle>
              </CardHeader>
              <CardContent className="relative w-full h-[400px]">
                <Suspense
                  fallback={
                    <Skeleton className="w-full h-full rounded-lg" />
                  }
                >
                  <LineChart data={formattedChartData} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  </div>
);
}

export default App;
 