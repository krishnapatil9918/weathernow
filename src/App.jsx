import { useState } from "react";
import axios from "axios";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Weather code mappings
  const weatherCodes = {
    0: "Clear sky ☀️",
    1: "Mainly clear 🌤️",
    2: "Partly cloudy ⛅",
    3: "Overcast ☁️",
    45: "Fog 🌫️",
    48: "Depositing rime fog 🌫️",
    51: "Light drizzle 🌦️",
    53: "Moderate drizzle 🌧️",
    55: "Dense drizzle 🌧️",
    61: "Slight rain 🌦️",
    63: "Moderate rain 🌧️",
    65: "Heavy rain 🌧️",
    71: "Slight snow fall ❄️",
    73: "Moderate snow fall ❄️",
    75: "Heavy snow fall 🌨️",
    80: "Rain showers 🌦️",
    81: "Moderate rain showers 🌧️",
    82: "Violent rain showers ⛈️",
    95: "Thunderstorm ⛈️",
    96: "Thunderstorm with hail ⛈️",
    99: "Thunderstorm with heavy hail ⛈️",
  };

  // Map weather code → background gradient
  const getBgGradient = (code) => {
    if (code === null || code === undefined) return "from-sky-200 via-blue-400 to-blue-600";
    if ([0, 1].includes(code))
      return "from-yellow-200 via-orange-300 to-yellow-500";
    if ([2, 3].includes(code))
      return "from-sky-200 via-blue-300 to-blue-500";
    if ([45, 48].includes(code))
      return "from-gray-200 via-gray-400 to-gray-600";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
      return "from-slate-400 via-blue-500 to-gray-700";
    if ([71, 73, 75].includes(code))
      return "from-cyan-100 via-blue-200 to-slate-400";
    if ([95, 96, 99].includes(code))
      return "from-indigo-900 via-purple-700 to-yellow-400";
    return "from-sky-200 via-blue-400 to-blue-600";
  };

  const getWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      // Step 1: Get coordinates
      const geoRes = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`
      );

      const results = geoRes.data.results;
      if (!results || results.length === 0) {
        setError("City not found");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = results[0];

      // Step 2: Fetch weather data
      const weatherRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=sunrise,sunset&timezone=auto`
      );

      const current = weatherRes.data.current_weather;
      const daily = weatherRes.data.daily;

      setWeather({
        name,
        country,
        temperature: current.temperature,
        windspeed: current.windspeed,
        winddirection: current.winddirection,
        weathercode: current.weathercode,
        time: current.time,
        sunrise: daily.sunrise?.[0],
        sunset: daily.sunset?.[0],
      });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  const bgGradient = getBgGradient(weather?.weathercode);

  return (
    <main
      className={`min-h-screen flex items-center justify-center bg-linear-to-br ${bgGradient} transition-colors duration-700 p-6 text-gray-900 font-sans`}
    >
      <div className="flex flex-col items-center justify-center gap-8 w-full max-w-md">
        {/* Header */}
        <h1 className="text-4xl font-extrabold text-white drop-shadow-lg flex items-center gap-2">
          🌤 <span>Weather Now</span>
        </h1>

        {/* Input */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-md shadow-sm"
          />
          <button
            onClick={getWeather}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-2xl shadow-md transition-all active:scale-95"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-800 bg-red-100 px-4 py-2 rounded-xl shadow-sm text-center w-full">
            ⚠️ {error}
          </p>
        )}

        {/* Weather card */}
        {weather && (
          <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl text-center w-full transition-all duration-300 hover:scale-105">
            <h2 className="text-2xl font-bold mb-2">
              {weather.name}, {weather.country}
            </h2>
            <p className="text-6xl font-extrabold my-4">
              {weather.temperature}°C
            </p>
            <div className="text-gray-700 space-y-2 text-sm">
              <p>
                🌦️ <strong>Condition:</strong>{" "}
                {weatherCodes[weather.weathercode] || "Unknown"}
              </p>
              <p>
                💨 <strong>Wind:</strong> {weather.windspeed} km/h
              </p>
              <p>
                🧭 <strong>Direction:</strong> {weather.winddirection}°
              </p>
              {weather.sunrise && (
                <p>
                  🌅 <strong>Sunrise:</strong>{" "}
                  {new Date(weather.sunrise).toLocaleTimeString()}
                </p>
              )}
              {weather.sunset && (
                <p>
                  🌇 <strong>Sunset:</strong>{" "}
                  {new Date(weather.sunset).toLocaleTimeString()}
                </p>
              )}
              {weather.time && (
                <p>
                  ⏱️ <strong>Updated:</strong>{" "}
                  {new Date(weather.time).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
