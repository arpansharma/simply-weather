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