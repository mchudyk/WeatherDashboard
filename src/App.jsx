import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams} from 'react-router-dom';
import './App.css';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempRange, setTempRange] = useState({ min: '', max: '' });
  const [humidityRange, setHumidityRange] = useState({ min: '', max: '' });
  const API_KEY = '91954f7fae494fc596b9343839ebcdbb';

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`https://api.weatherbit.io/v2.0/history/daily?postal_code=27601&country=US&start_date=2023-09-12&end_date=2023-10-12&key=${API_KEY}`);
        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    }
    fetchData();
  }, []);

  const filteredData = weatherData ? weatherData.data
    .filter(day => day.datetime.includes(searchTerm))
    .filter(day => (tempRange.min ? day.temp >= tempRange.min : true) && (tempRange.max ? day.temp <= tempRange.max : true))
    .filter(day => (humidityRange.min ? day.rh >= humidityRange.min : true) && (humidityRange.max ? day.rh <= humidityRange.max : true))
    : [];

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard filteredData={filteredData} setSearchTerm={setSearchTerm} setTempRange={setTempRange} setHumidityRange={setHumidityRange} />} />
        <Route path="/detail/:date" element={<Detail weatherData={weatherData} />} />
      </Routes>
    </BrowserRouter>
  );
}

function Dashboard({ filteredData, setSearchTerm, setTempRange, setHumidityRange }) {
  const totalDays = filteredData.length;
  const averageTemp = (filteredData.reduce((acc, curr) => acc + curr.temp, 0) / totalDays).toFixed(2);
  const averageHumidity = (filteredData.reduce((acc, curr) => acc + curr.rh, 0) / totalDays).toFixed(2);

  return (
    <div>
      <div className="summary">
        <div>Total Days: {totalDays}</div>
        <div>Average Temperature: {averageTemp}°C</div>
        <div>Average Humidity: {averageHumidity}%</div>
      </div>
      <div className="filters">
        <input 
          type="text" 
          placeholder="Search by Date (YYYY-MM-DD)" 
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div>
          <label>Temperature Range:</label>
          <input 
            type="number" 
            placeholder="Min Temp" 
            onChange={e => setTempRange(prev => ({ ...prev, min: e.target.value }))}
          />
          -
          <input 
            type="number" 
            placeholder="Max Temp" 
            onChange={e => setTempRange(prev => ({ ...prev, max: e.target.value }))}
          />
        </div>
        <div>
          <label>Humidity Range:</label>
          <input 
            type="number" 
            placeholder="Min Humidity" 
            onChange={e => setHumidityRange(prev => ({ ...prev, min: e.target.value }))}
          />
          -
          <input 
            type="number" 
            placeholder="Max Humidity" 
            onChange={e => setHumidityRange(prev => ({ ...prev, max: e.target.value }))}
          />
        </div>
      </div>

      <div className="chart-container">
        <h2>Temperature Distribution Over Time</h2>
        <BarChart
          width={600}
          height={300}
          data={filteredData}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="datetime" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="temp" fill="#8884d8" name="Temperature (°C)" />
        </BarChart>
      </div>

      <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Temperature</th>
          <th>Max Temperature</th>
          <th>Min Temperature</th>
          <th>Pressure</th>
          <th>Humidity</th>
          <th>Details</th>
        </tr>
      </thead>
        <tbody>
          {filteredData.map(day => (
            <tr key={day.datetime}>
              <td>{day.datetime}</td>
              <td>{day.temp}°C</td>
              <td>{day.max_temp}°C</td>
              <td>{day.min_temp}°C</td>
              <td>{day.pres} mb</td>
              <td>{day.rh}%</td>
              <td>
                <Link to={`/detail/${day.datetime}`}>Details</Link>
              </td>
            </tr>
          ))}
          {filteredData.length === 0 && <tr><td colSpan="7">No results found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}


function Detail({ weatherData }) {
  const { date } = useParams();
  const weather = weatherData && weatherData.data && weatherData.data.find(day => day.datetime === date);

  if (!weather) return <div>Data not found for the given date.</div>;

  return (
      <div className="detail-view">
          <h2>Weather Details for {date}</h2>
          <p><strong>Temperature:</strong> {weather.temp}°C</p>
          <p><strong>Max Temperature:</strong> {weather.max_temp}°C</p>
          <p><strong>Min Temperature:</strong> {weather.min_temp}°C</p>
          <p><strong>Pressure:</strong> {weather.pres} mb</p>
          <p><strong>Humidity:</strong> {weather.rh}%</p>
          <br />
          <Link to="/"><button>Dashboard</button></Link>
      </div>
  );
}


export default App;
