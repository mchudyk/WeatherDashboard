import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempRange, setTempRange] = useState({ min: '', max: '' });
  const [humidityRange, setHumidityRange] = useState({ min: '', max: '' });

  const API_KEY = '91954f7fae494fc596b9343839ebcdbb'; // Replace with your API key

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

  // Calculate summary statistics
  const totalDays = filteredData.length;
  const averageTemp = (filteredData.reduce((acc, curr) => acc + curr.temp, 0) / totalDays).toFixed(2);
  const averageHumidity = (filteredData.reduce((acc, curr) => acc + curr.rh, 0) / totalDays).toFixed(2);

  return (
    <div>
      {/* Summary Blocks */}
      <div className="summary">
        <div>Total Days: {totalDays}</div>
        <div>Average Temperature: {averageTemp}°C</div>
        <div>Average Humidity: {averageHumidity}%</div>
      </div>

      {/* Filters */}
      <div className="filters">
        <input 
          type="text" 
          placeholder="Search by Date (YYYY-MM-DD)" 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div>
          <label>Temperature Range:</label>
          <input 
            type="number" 
            placeholder="Min Temp" 
            value={tempRange.min}
            onChange={e => setTempRange(prev => ({ ...prev, min: e.target.value }))}
          />
          -
          <input 
            type="number" 
            placeholder="Max Temp" 
            value={tempRange.max}
            onChange={e => setTempRange(prev => ({ ...prev, max: e.target.value }))}
          />
        </div>
        <div>
          <label>Humidity Range:</label>
          <input 
            type="number" 
            placeholder="Min Humidity" 
            value={humidityRange.min}
            onChange={e => setHumidityRange(prev => ({ ...prev, min: e.target.value }))}
          />
          -
          <input 
            type="number" 
            placeholder="Max Humidity" 
            value={humidityRange.max}
            onChange={e => setHumidityRange(prev => ({ ...prev, max: e.target.value }))}
          />
        </div>
      </div>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Temperature</th>
            <th>Max Temperature</th>
            <th>Min Temperature</th>
            <th>Pressure</th>
            <th>Humidity</th>
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
            </tr>
          ))}
          {filteredData.length === 0 && <tr><td colSpan="6">No results found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default App;
