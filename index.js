var map, infowindow, infowindowContent, marker;

window.addEventListener('load', ()=> {
    let latitude, longitude;
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(position => {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            document.getElementById("pac-input").value="";
            fetchWeatherInfo(latitude, longitude, (weatherInfo) =>{
                fetchDateTimeInfo(weatherInfo, createMarkerAndInfowindow)
            })
        },
        position => {
            console.log('Else Called')
            latitude = 28.6139;
            longitude = 77.2090;
            document.getElementById("pac-input").value="";
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


fetchDateTimeInfo=(response, callBackFunc) => {
    const cors_proxy = "https://cors-anywhere.herokuapp.com/";
    const api_key = "YOUR_TIMEZONE_DB_API_KEY";
    const api = `${cors_proxy}http://api.timezonedb.com/v2.1/get-time-zone?key=${api_key}&format=json&by=position&lat=${response.latitude}&lng=${response.longitude}`;
    fetch(api)
        .then(response => {
            return response.json();
        })
        .then(data => {
            const tz_abbr = data.abbreviation;
            const tz_name = data.zoneName;
            const date_time = data.formatted;

            response.tz_abbr = tz_abbr;
            response.tz_name = tz_name;
            response.date_time = date_time;
            console.log("fetchDateTimeInfo Response : ", response);

            callBackFunc(response)
        });
}


createMarkerAndInfowindow=(response) => {
    const latitude = response.latitude
    const longitude = response.longitude

    // Removing elements from the map
    infowindow.close();
    marker.setVisible(false);
    marker.setPosition({'lat': latitude, 'lng': longitude});
    marker.setVisible(true);

    console.log("createMarkerAndInfowindow Request :", response )

    infowindow.setContent(infowindowContent);

    infowindowContent.children["date-time"].textContent = response.date_time;
    infowindowContent.children["timezone"].textContent = response.tz_name + " (" + response.tz_abbr + ")";
    infowindowContent.children["current-temp"].textContent = "Current Temp : " + response.current_temp;
    infowindowContent.children["minimum-temp"].textContent = "Minimum Temp : " + response.minimum_temp;
    infowindowContent.children["maximum-temp"].textContent = "Maximum Temp : " + response.maximum_temp;
    infowindowContent.children["weather-description"].textContent = "Weather : " + response.weather_description;

    // Creating elements on the map
    map.setCenter({'lat': latitude, 'lng': longitude});
    map.setZoom(10);
    marker.setVisible(true);
    infowindow.open(map, marker);
}


initMap=() => {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 0, lng: 0 },
        zoom: 2,
    });

    infowindow = new google.maps.InfoWindow();
    infowindowContent = document.getElementById("infowindow-content");
    infowindow.setContent(infowindowContent);
    marker = new google.maps.Marker({
        map,
        anchorPoint: new google.maps.Point(0, -29),
    });
    
    const card = document.getElementById("pac-card");
    const input = document.getElementById("pac-input");
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);
    
    const autocomplete = new google.maps.places.Autocomplete(input);

    /*
    Bind the map's bounds (viewport) property to the autocomplete object, so that
    the autocomplete requests use the current map bounds for the bounds option in the request
    */
    autocomplete.bindTo("bounds", map);
    autocomplete.setFields(["address_components", "geometry", "icon", "name"]);

    // Place change listener for automcomplete
    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(10);
        }

        const latitude = place.geometry.location.lat()
        const longitude = place.geometry.location.lng()
        fetchWeatherInfo(latitude, longitude, (weatherInfo) =>{
            fetchDateTimeInfo(weatherInfo, createMarkerAndInfowindow)
        })
    });

    map.addListener("click", (mouseClickEvent) => {
        const latitude = mouseClickEvent.latLng.lat();
        const longitude = mouseClickEvent.latLng.lng();
        document.getElementById("pac-input").value = "";

        fetchWeatherInfo(latitude, longitude, (weatherInfo) =>{
            fetchDateTimeInfo(weatherInfo, createMarkerAndInfowindow)
        })
    });
}