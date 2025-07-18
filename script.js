const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezone = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');
const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');


const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const API_KEY = CONFIG.API_KEY;

setInterval(() => {
    const time = new Date();
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const hour = time.getHours();
    const hoursIn12HrFormat = hour >= 13 ? hour %12: hour
    const minutes = time.getMinutes();
    const ampm = hour >=12 ? 'PM' : 'AM'

    timeEl.innerHTML = (hoursIn12HrFormat < 10? '0'+hoursIn12HrFormat : hoursIn12HrFormat) + ':' + (minutes < 10? '0'+minutes: minutes)+ ' ' + `<span id="am-pm">${ampm}</span>`

    dateEl.innerHTML = days[day] + ', ' + date+ ' ' + months[month]

}, 1000);

/* погода по геолокации (автоматически) */

getWeatherData()
function getWeatherData () {
    navigator.geolocation.getCurrentPosition((success) => {
        
        let {latitude, longitude } = success.coords;

        fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`)
        .then(res => res.json())
        .then(data => {

        console.log(data)
        showWeatherData(data);
        })

    })
}

/* погода по городу */

function getWeatherByCoordinates(lat, lon) {
    fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            showWeatherData(data);
        })
        .catch(error => {
            console.error("Error loading the weather:", error);
        });
}

function getWeatherDataCity(city) {
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            if (data.length == 0) {
                alert("No city found. Try another.");
                return;
            }

            const { lat, lon } = data[0];
            getWeatherByCoordinates(lat, lon);
        })
        .catch(error => {
            console.error("Error when getting the coordinates of the city:", error);
            alert("An error occurred when searching for a city.");
        });
}

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city != '') {
        getWeatherDataCity(city);
    }
});
/* график */

const ctx = document.getElementById('tempChart').getContext('2d');

const tempChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        datasets: [
            {
                label: 'Day Temperature (°C)',
                data: [21, 22, 23, 24, 25, 26, 27],
                backgroundColor: 'rgba(255, 159, 64, 0.7)',
                borderColor: 'rgba(255, 159, 64, 0.7',
                pointBackgroundColor: '#fff'
            },
            {
                label: 'Night Temperature (°C)',
                data: [18, 19, 20, 17, 5, 3, 8],
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1',
                pointBackgroundColor: '#000000'
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: '#fff',
                    font: {
                        size: 12
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#fff'
                }
            },
            y: {
                ticks: {
                    color: '#fff'
                },
                title: {
                    display: true,
                    text: 'Temperature (°C)',
                    color: '#fff'
                }
            }
        }
    }
});

function showWeatherData (data){
    let {humidity, pressure, sunrise, sunset, wind_speed} = data.current;

    timezone.innerHTML = data.timezone;
    countryEl.innerHTML = data.lat + 'N ' + data.lon+'E'

    currentWeatherItemsEl.innerHTML = 
    `<div class="weather-item">
        <div>Humidity</div>
        <div>${humidity}%</div>
    </div>
    <div class="weather-item">
        <div>Pressure</div>
        <div>${pressure}</div>
    </div>
    <div class="weather-item">
        <div>Wind Speed</div>
        <div>${wind_speed}</div>
    </div>

    <div class="weather-item">
        <div>Sunrise</div>
        <div>${window.moment(sunrise * 1000).format('HH:mm a')}</div>
    </div>
    <div class="weather-item">
        <div>Sunset</div>
        <div>${window.moment(sunset*1000).format('HH:mm a')}</div>
    </div>
    
    
    `;

    let otherDayForcast = ''
    data.daily.forEach((day, idx) => {
        if(idx == 0){
            currentTempEl.innerHTML = `
            <img src="http://openweathermap.org/img/wn//${day.weather[0].icon}@4x.png" alt="weather icon" class="w-icon">
            <div class="other">
                <div class="day">${window.moment(day.dt*1000).format('dddd')}</div>
                <div class="temp">Day: ${day.temp.day}&#176;C</div>
                <div class="temp">Night: ${day.temp.night}&#176;C</div>
            </div>
            
            `
        }else{
            otherDayForcast += `
            <div class="weather-forecast-item">
                <div class="day">${window.moment(day.dt*1000).format('ddd')}</div>
                <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                <div class="temp">Day: ${day.temp.day}&#176;C</div>
                <div class="temp">Night: ${day.temp.night}&#176;C</div>
            </div>
            
            `
        }
    })

    /* сбор данных для графика */

    const labels = [];
    const dayTemps = [];
    const nightTemps = [];

    data.daily.slice(0, 7).forEach(day => {
        labels.push(window.moment(day.dt*1000).format('ddd'));
        dayTemps.push(day.temp.day);
        nightTemps.push(day.temp.night);
    });

    tempChart.labels = labels;
    tempChart.data.datasets[0].data = dayTemps;
    tempChart.data.datasets[1].data = nightTemps;
    tempChart.update();

    weatherForecastEl.innerHTML = otherDayForcast;
}
