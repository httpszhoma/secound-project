// API Keys for OpenWeatherMap and Google Maps Geocoding
const apiKey = "0d87f9bf52ee254d6eea9d850a8a8beb";
const googleApiKey = "AIzaSyD6Z5yQNPwjK3f5dFSbJWic212QfHwz76A";

// Elements object to store all DOM references for easier access
const elements = {
    container: document.querySelector(".container"),
    searchBtn: document.querySelector(".search-box .search-button"),
    weatherInfo: document.querySelector(".weather-info"),
    img: document.querySelector("#weather-image"),
    temperature: document.querySelector(".temperature"),
    temperatureType: document.querySelector(".temperature-type"),
    weatherState: document.querySelector(".weather-state"),
    humidityInfo: document.querySelector(".humidity .information h2"),
    windSpeedInfo: document.querySelector(".wind-speed .information h2"),
    additionalInfo: document.querySelector(".additional-info"),
    notFound: document.querySelector(".not-found"),
    searchInput: document.querySelector(".search-box input"),
    unitToggle: document.querySelector(".unit-toggle"),
    forecastContainer: document.querySelector(".forecast-container"),
    currentCity: document.querySelector(".currentCity"),
};

// Weather images based on condition
const weatherImages = {
    Clear: "images/clear.png",
    Clouds: "images/cloud.png",
    Rain: "images/rain.png",
    Snow: "images/snow.png",
    Haze: "images/mist.png",
    Mist: "images/mist.png",
    Smoke: "images/mist.png",
    Default: "images/default.png",
    NotFound: "images/404.png",
};
let isCelsius = true;

// 1. Initialization

// Initialize autocomplete for city search input
function initializeAutocomplete() {
    const autocomplete = new google.maps.places.Autocomplete(
        elements.searchInput,
        { types: ["(cities)"] }
    );

    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
            const city = place.name;
            fetchWeather(city);
        }
    });
}

window.onload = initializeAutocomplete;

// 2. Fetch Weather Data

// Fetches current weather data for a specified city
async function fetchWeather(city) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(weatherUrl);
        const data = await response.json();
        if (data.cod == 200) {
            updateWeatherDisplay(data, city);
            getFiveDayForecast(city);
        } else {
            showNotFound();
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

// Fetches a 5-day weather forecast for a specified city
async function getFiveDayForecast(city) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(forecastUrl);
        const data = await response.json();

        if (data.cod !== "200") {
            showNotFound();
            return;
        }

        const dailyForecasts = {};
        data.list.forEach((item) => {
            const date = item.dt_txt.split(" ")[0];
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = {
                    highTemp: item.main.temp_max,
                    lowTemp: item.main.temp_min,
                    weather: item.weather[0].main,
                    description: item.weather[0].description,
                };
            } else {
                dailyForecasts[date].highTemp = Math.max(dailyForecasts[date].highTemp, item.main.temp_max);
                dailyForecasts[date].lowTemp = Math.min(dailyForecasts[date].lowTemp, item.main.temp_min);
            }
        });

        const fiveDayForecast = Object.keys(dailyForecasts)
            .slice(0, 5)
            .map((date) => ({
                date,
                highTemp: dailyForecasts[date].highTemp,
                lowTemp: dailyForecasts[date].lowTemp,
                weather: dailyForecasts[date].weather,
                description: dailyForecasts[date].description,
            }));

        displayFiveDayForecast(fiveDayForecast);
    } catch (error) {
        console.error("Error:", error);
    }
}

// 3. UI Updates

// Updates the weather display with data from the API
function updateWeatherDisplay(data, city) {
    const { temp: temperatureValue, humidity: humidityValue } = data.main;
    const weatherStateValue = data.weather[0].main;
    const weatherDescription = data.weather[0].description;
    const windSpeedValue = data.wind.speed;
    elements.currentCity.innerHTML = `${capitalizeFirstLetter(city)}`;
    elements.temperature.innerHTML = `${Math.round(temperatureValue)}<span class="temperature-type">°C</span>`;
    elements.weatherState.textContent = capitalizeFirstLetter(weatherDescription);
    elements.humidityInfo.textContent = `${humidityValue}%`;
    elements.windSpeedInfo.textContent = `${Math.round(windSpeedValue * 3.6)} km/h`;

    updateWeatherImage(weatherStateValue);
    toggleDisplay(true);
}

// Displays a 5-day forecast based on the fetched data
function displayFiveDayForecast(forecastData) {
    elements.forecastContainer.innerHTML = ""; 

    forecastData.forEach((day) => {
        const forecastCard = document.createElement("div");
        forecastCard.className = "forecast-card";

        forecastCard.innerHTML = `
            <div class="forecast-date">${day.date}</div>
            <img src="${weatherImages[day.weather] || weatherImages.Default}" alt="${day.description}">
            <div class="forecast-temp">High: ${Math.round(day.highTemp)}°C</div>
            <div class="forecast-temp">Low: ${Math.round(day.lowTemp)}°C</div>
            <div class="forecast-description">${day.description}</div>
        `;

        elements.forecastContainer.appendChild(forecastCard);
    });
}

// Shows a "not found" message if the city or forecast data is unavailable
function showNotFound() {
    elements.img.src = weatherImages.NotFound;
    elements.img.style.marginBlock = "60px";

    toggleDisplay(false);
}

// Updates the weather image based on the current weather state
function updateWeatherImage(weatherState) {
    elements.img.src = weatherImages[weatherState] || weatherImages.Default;
}

// Toggles the display of different UI elements based on data availability
function toggleDisplay(isDataAvailable) {
    elements.additionalInfo.style.display = isDataAvailable ? "flex" : "none";
    elements.temperature.style.display = isDataAvailable ? "block" : "none";
    elements.currentCity.style.display = isDataAvailable ? "block" : "none";

    elements.unitToggle.style.display = isDataAvailable ? "block" : "none";
    elements.forecastContainer.style.display = isDataAvailable ? "grid" : "none";
    elements.weatherState.style.display = isDataAvailable ? "block" : "none";
    elements.notFound.style.display = isDataAvailable ? "none" : "block";
    elements.img.style.marginBlock = isDataAvailable ? "0" : "60px";
    // elements.img.style.display = isDataAvailable ? "block" : "none";

    
}

// 4. Utility Functions

// Capitalizes the first letter of a given string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// 5. Event Handlers

// Event listener for search button click to fetch weather for entered city
elements.searchBtn.addEventListener("click", () => {
    const city = elements.searchInput.value.trim() || "Almaty";
    fetchWeather(city);
});

// Event listener to toggle temperature units between Celsius and Fahrenheit
elements.unitToggle.addEventListener("click", () => {
    isCelsius = !isCelsius;
    elements.unitToggle.textContent = isCelsius ? "°C / °F" : "°F / °C";
    convertTemperature();
});

// Converts temperature between Celsius and Fahrenheit
function convertTemperature() {
    const tempText = elements.temperature.textContent;

    const temp = parseFloat(tempText);
    const newTemp = isCelsius ? (temp - 32) * (5 / 9) : (temp * 9) / 5 + 32;
    elements.temperature.innerHTML = `${Math.round(newTemp)}<span class="temperature-type">°${isCelsius ? "C" : "F"}</span>`;
}

// 6. Geolocation

// Retrieves the user's current latitude and longitude
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
            },
            (error) => {
                console.error("Error getting location:", error.message);
            }
        );
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

// Gets the user's current city based on geolocation
function getCurrentCity() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`;

                    try {
                        const response = await fetch(geocodeUrl);
                        const data = await response.json();

                        if (data.status === "OK") {
                            const addressComponents = data.results[0].address_components;
                            const cityComponent = addressComponents.find((component) =>
                                component.types.includes("locality")
                            );
                            const city = cityComponent ? cityComponent.long_name : "City not found";
                            console.log(city);
                            resolve(city);
                        } else {
                            reject("Geocoding API error: " + data.status);
                        }
                    } catch (error) {
                        reject("Error fetching geocode data: " + error);
                    }
                },
                (error) => {
                    reject("Geolocation error: " + error.message);
                }
            );
        } else {
            reject("Geolocation is not supported by this browser.");
        }
    });
}

// Fetches weather data for the current city on load
getCurrentCity()
    .then((city) => {
        const currectCity = city.trim();
        fetchWeather(currectCity); 
    })
    .catch((error) => {
        console.error("Error getting current city:", error);
    });
