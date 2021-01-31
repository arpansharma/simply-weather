window.addEventListener('load', ()=> {
    let latitude, longitude;
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(position => {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            fetchWeatherInfo(latitude, longitude, (weatherInfo) =>{
                fetchDateTimeInfo(weatherInfo, createMarkerAndInfowindow)
            })
        },
        position => {
            console.log('Else Called')
            latitude = 28.6139;
            longitude = 77.2090;
            fetchWeatherInfo(latitude, longitude, (weatherInfo) =>{
                fetchDateTimeInfo(weatherInfo, createMarkerAndInfowindow)
            })
        });
    }
});

fetchWeatherInfo=(latitude, longitude, callBackFunc) => {
    const cors_proxy = "https://cors-anywhere.herokuapp.com/";
    const api_key = "YOUR_OPEN_WEATHER_API_KEY";
    const api = `${cors_proxy}api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${api_key}`;

    fetch(api)
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log("Weather API Response : ", data);
            const {temp, temp_min, temp_max} = data.main
            const {description} = data.weather[0]

            // Set elements from the API
            current_temp = (temp - 273.15).toFixed(2)
            minimum_temp = (temp_min - 273.15).toFixed(2)
            maximum_temp = (temp_max - 273.15).toFixed(2)
            weather_description = description

            response = {
                "latitude": latitude,
                "longitude": longitude,
                "current_temp": current_temp,
                "minimum_temp": minimum_temp,
                "maximum_temp": maximum_temp,
                "weather_description": weather_description,
            }
            console.log("fetchWeatherInfo Response : ", response);

            callBackFunc(response)
        });
}
