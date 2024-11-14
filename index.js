const form = document.querySelector(".locationForm")
const input = document.querySelector("input")
const actualTemp = document.querySelector(".actual-temp")
const feelsLikeTemp = document.querySelector(".perceived-temp")
const cityName = document.getElementById("cityName")
const sunRiseTime = document.getElementById("sunrise-time")
const sunSetTime = document.getElementById("sunset-time")
const weatherDesc = document.getElementById("weatherDesc")
const currHumidity = document.getElementById("currHumidity")
const currPressure = document.getElementById("currPressure")
const currWindSp = document.getElementById("currWindSp")
const currVis = document.getElementById("currVis")
const currTime = document.getElementById("currTime")
const currDate = document.getElementById("currDate")
const CurrWeatherIcon = document.getElementById("curr-weather-icon")
const forcastItems = document.querySelector(".forcast-items")
const hourlyForcastItems = document.querySelector(".hourly-forecast-items")


function humanReadableTime(seconds, timezoneOffset = 0) {
    // Adjust for the timezone diff by adding the offset to the timestamp
    const date = new Date((seconds + timezoneOffset) * 1000);
    const formattedDate = (entryDate) => {
        const options = { weekday: 'short', month: 'short', day: '2-digit' };
        return entryDate.toLocaleDateString('en-US', options);
    };
	// Local date & time in the queried city timezone
    const formatted_datetime = {
        time: date.toLocaleTimeString(),  
        date: formattedDate(date) }; 
    return formatted_datetime; 
}


form.addEventListener('submit', (e) => {
    e.preventDefault()
    getCurrentWeather(`https://api.openweathermap.org/data/2.5/weather?q=${input.value}&appid=${apiKey}&units=metric`);
    getThreeDayForecast(`https://api.openweathermap.org/data/2.5/forecast?q=${input.value}&appid=${apiKey}&units=metric`);
})

const apiKey = '8d1fe1b282c9be0f6b981381af8ce9c1';


// Fetch current weather data
const getCurrentWeather = async (dataUrl) => {
  const url = dataUrl;
  try {
    const response = await axios.get(url);
    const data = response.data;
    actualTemp.innerHTML = `${data.main.temp}&deg;C`
    feelsLikeTemp.innerHTML = `Feels Like : ${data.main.feels_like}&deg;C`
    cityName.textContent = `${data.name}`
    sunRiseTime.textContent = `${humanReadableTime(data.sys.sunrise, data.timezone).time}`
    sunSetTime.textContent = `${humanReadableTime(data.sys.sunset, data.timezone).time}`
    weatherDesc.textContent=`${data.weather[0].description}`
    CurrWeatherIcon.src = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`
    currPressure.textContent=`${data.main.pressure}Pa`
    currHumidity.textContent=`${data.main.humidity}%`
    currVis.textContent=`${data.visibility / 1000}Km`
    currWindSp.textContent=`${data.wind.speed}m/s`
    currTime.textContent = `${humanReadableTime(data.dt, data.timezone).time}`
    currDate.textContent = `${humanReadableTime(data.dt, data.timezone).date}`
  } catch (error) {
    console.error("Error fetching current weather:", error);
  }
};


// Fetch 3-day forecast data (from 5-day, 3-hour interval forecast)
const getThreeDayForecast = async (forecastUrl) => {
  const url = forecastUrl
  try {
    const response = await axios.get(url);
    const data = response.data;
    const currentDate = new Date();

    // Set the end of today
    const endOfToday = new Date(currentDate);
    endOfToday.setHours(23, 59, 59, 999);

    // Filter for today's forecast (every 3 hours )
    const todaysForecast = data.list.filter(entry => {
      const entryDate = new Date(entry.dt * 1000);
      return entryDate <= endOfToday;
    });

    // Filter for future forecasts (one per day)
    const futureForecast = data.list.filter(entry => {
      const entryDate = new Date(entry.dt * 1000);
      return entryDate > endOfToday;
    });

   

    // Format the temperature (e.g., "11 / 7°C")
    const formatTemp = (tempMax, tempMin) => {
      return `${tempMax} / ${tempMin}°C`;
    };

    // Display Today's Forecast (every 3 hours)
	hourlyForcastItems.innerHTML=''
    todaysForecast.forEach(entry => {
      const date = new Date(entry.dt * 1000);
      const newDiv = document.createElement("div");
      newDiv.classList.add('hourly-forecast-item');
      newDiv.innerHTML = `
	  <p class="hf-time">${date.toLocaleTimeString()}</p>
	  <div class="hr-forecast-detail">
			<p class="hf-temp">${entry.main.temp}&deg;C</p>
			<p class="hf-icon"><img src='https://openweathermap.org/img/w/${entry.weather[0].icon}.png'></p>
			<p class="hf-temp caps">${entry.weather[0].description}</p>
			<p class="hf-wind-speed">Wind - ${entry.wind.speed} m/s </p>
		</div> `;
      hourlyForcastItems.appendChild(newDiv);
    });

    let lastDate = null;
	let counter=0
		forcastItems.innerHTML=''
    futureForecast.forEach(entry => {
      if (counter < 3) {
        const dateStr = humanReadableTime(entry.dt, data.timezone).date;

        // Only create a new forecast div for new days (group by day)
        if (dateStr !== lastDate) {
			const tempMax = Math.round(entry.main.temp_max);
			const tempMin = Math.round(entry.main.temp_min);
			const newDiv = document.createElement("div");
			newDiv.classList.add('forecast-item');
			newDiv.innerHTML = `
				<p class="forecast-day">${dateStr}</p>
				<div class="fut-forecast-detail">
					<p class=""><img src='https://openweathermap.org/img/w/${entry.weather[0].icon}.png'></p>
					<p class="forecast-temp">${formatTemp(tempMax, tempMin)}</p>
					<p class="forecast-weather caps">${entry.weather[0].description}</p>
				</div> `;
			forcastItems.appendChild(newDiv);
			lastDate = dateStr; // Update the last date
			counter++
			}
		}
    });

  } catch (error) {
    console.error("Error fetching forecast:", error);
  }
};


// theme switcher
document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.querySelector(".switcher");
    const roller = document.querySelector(".ball");
    const body = document.body;
    //Check if the user has a stored theme preference
    if (localStorage.getItem("weather-app-theme") === "light-mode") {
      body.classList.add("light-mode");
	roller.style.transform="translateX(100%)"
	toggleButton.style.background='#333'
} else {
	body.classList.add("dark-mode");
	roller.style.transform="translateX(0)"
	toggleButton.style.background='#fff'
    }
    toggleButton.addEventListener("click", () => {
      if (body.classList.contains("light-mode")) {
        body.classList.remove("light-mode");
        roller.style.transform="translateX(0)"
        localStorage.setItem("weather-app-theme", "dark-mode");
		toggleButton.style.background='#fff'
    } else {
        body.classList.add("light-mode");
        roller.style.transform="translateX(100%)"
        localStorage.setItem("weather-app-theme", "light-mode");
		toggleButton.style.background='#333'
      }
    });
  });


//get users weather location based on their Ip 
 function getLocalWeatherInfo() {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
           getCurrentWeather(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric` )
           getThreeDayForecast(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric` )
      }, function(error) {
          document.getElementById("location").innerHTML = "Error getting location: " + error.message;
      });
  } else {
      document.getElementById("location").innerHTML = "Geolocation is not supported by this browser.";
  }
};


window.onload =getLocalWeatherInfo()


