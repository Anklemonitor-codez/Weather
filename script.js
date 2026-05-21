const weatherCodes = {
    0: {
        text: "Clear sky",
        icon: "☀️"
    },

    1: {
        text: "Mainly clear",
        icon: "🌤️"
    },

    2: {
        text: "Partly cloudy",
        icon: "⛅"
    },

    3: {
        text: "Overcast",
        icon: "☁️"
    },

    61: {
        text: "Rain",
        icon: "🌧️"
    },

    95: {
        text: "Thunderstorm",
        icon: "⛈️"
    }
};

async function getWeather(lat, lon, cityName) {
    try {   
        
        const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`
        );

        const data = await response.json();

        console.log(data);
        
        const icon = weatherCodes[data.current.weather_code].icon
        const weatherDesc = weatherCodes[data.current.weather_code].text

        let maxRainChance = 0;

        for (let i = 0; i < 24; i++) {
            const chance = data.hourly.precipitation_probability[i];

            if (chance > maxRainChance) {
                maxRainChance = chance;
            }
        }

        console.log(icon, weatherDesc)

        document.getElementById("location").textContent =
            `${cityName}, ${townName}`

        document.getElementById("current-temp").textContent =
            `${data.current.temperature_2m}°C`;

        document.getElementById("current-temp-feels-like").textContent =
            `Feels like: ${data.current.apparent_temperature}°C`;

        document.getElementById("weather-description").textContent =
            `${icon} ${weatherDesc}`;

        document.getElementById("current-humidity").textContent =
            `${data.current.relative_humidity_2m}%`

        document.getElementById("current-wind-speed").textContent =
            `${data.current.wind_speed_10m}km/h`

        document.getElementById("daily-temp-min").textContent =
            `Min: ${data.daily.temperature_2m_min[0]}°C`

        document.getElementById("daily-temp-max").textContent =
            `Max: ${data.daily.temperature_2m_max[0]}°C`

        document.getElementById("daily-rain-chance").textContent =
            `${maxRainChance}%`

        const ctx = document.getElementById("daily-forecast-graph");

        const labels = 

        new Chart(ctx, {
            type: "line",
            data: {
                labels: data.hourly.time.slice(0, 24).map(t => {
                    const d = new Date(t);
                    return d.toLocaleTimeString([], {
                        hour: "numeric",
                        hour12: true
                    });
                }),
                datasets: [
                    {
                        label: "Temperature (°C)",
                        data: data.hourly.temperature_2m.slice(0, 24),
                        borderColor: "red",
                        tension: 0.3
                    },

                    {
                        label: "Rain Chance (%)",
                        data: data.hourly.precipitation_probability.slice(0, 24),
                        borderColor: "blue"
                    }
                ]
            }
        }); 
    }
    catch(error) {
        console.error(error);
    }
}

async function searchCity() {

    const city =
    document.getElementById("city").value;

    const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
    );

    const data = await response.json();

    console.log(data);

    const place = data.results[0];

    const lat = place.latitude
    const lon = place.longitude
    const cityName = place.name
    const townName = place.admin2

    getWeather(lat, lon, cityName, townName);
}
