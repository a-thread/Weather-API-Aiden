$(document).ready(function () {
  const momentDate = moment().format("(M/D/YYYY)"); // current day

  // Getting Coordinates from current day api
  function getCoordinates(cityInput) {
    const queryURL =
      "https://api.openweathermap.org/data/2.5/weather?zip=" +
      cityInput +
      "&apikey=955452fde6d16eea4b0e62b34551cd90&units=imperial";

    $.get(queryURL).then(function (response) {
      if (history.indexOf(cityInput) === -1) {
        // preventing duplicate storage
        history.push(cityInput); // adding new input to history array
        window.localStorage.setItem("history", JSON.stringify(history)); // setting to local storage
      }
      const lat = response.coord.lat; // latitude
      const lon = response.coord.lon; // longitude

      $("h3.city-title").text(response.name); // displaying city name
      $("h5.date").text(momentDate); // displaying date

      // setting icon on title page
      $(".title-icon")
        .attr("src", [
          "http://openweathermap.org/img/w/" +
            response.weather[0].icon +
            ".png",
        ]) // with descriptions
        .attr("alt", response.weather[0].description);

      getWeather(lat, lon);
    });
  }

  // function to get most of the weather info from LAT & LON
  function getWeather(lat, lon) {
    var queryUrl =
      "https://api.openweathermap.org/data/2.5/onecall?lat=" +
      lat +
      "&lon=" +
      lon +
      "&apikey=955452fde6d16eea4b0e62b34551cd90&units=imperial";

    $.get(queryUrl).then(function (response) {
      var tempEl = $("<h6>") // current temp
        .addClass("city-temp")
        .text("Temperature: " + response.current.temp + "° F");
      var humEl = $("<h6>") // current humidity
        .addClass("city-hum")
        .text("Humidity: " + response.current.humidity + "%");
      var windEl = $("<h6>") // current wind speed
        .addClass("city-wind")
        .text("Wind Speed: " + response.current.wind_speed + "MPH"); // wind speed
      var uviData = response.current.uvi; // current UVI data
      var uviTitle = $("<h6>").addClass("city-uviTitle").text("UV Index:  "); // UVI label
      var uviBtn = $("<a>").addClass("btn-small").text(uviData); // UVI button

      // setting color of UVI btn according to sun safety guidelines
      if (uviData > 0 && uviData < 2) {
        // favorable
        uviBtn.addClass("green");
      } else if (uviData > 3 && uviData < 7) {
        // moderate
        uviBtn.addClass("yellow");
      } else {
        // severe
        uviBtn.addClass("red");
      }

      // appending current weather data elements to title card
      $(".location-specs")
        .append(tempEl, humEl, windEl)
        .append(uviTitle.append(uviBtn));

      // looping through the 5 day forecast
      for (var i = 1; i < 6; i++) {
        var time = moment.unix(response.daily[i].dt).format("ddd"); // getting date from API and setting format

        var card = $("<div>").addClass("card"); // creating card
        var cardTitle = $("<h7>").addClass("card-title").text(time); // setting title

        // getting & setting icon code
        var cardIcon = $("<img>")
          .addClass("card-icon")
          .attr("src", [
            "http://openweathermap.org/img/w/" +
              response.daily[i].weather[0].icon +
              ".png",
          ]) // with descriptions
          .attr("alt", response.daily[i].weather.description);

        // card temp
        var cardTemp = $("<p>")
          .addClass("card-temp")
          .text("Temp: " + response.daily[i].temp.day + "° F");

        // card humidity
        var cardHum = $("<p>")
          .addClass("card-temp")
          .text("Humidity: " + response.daily[i].humidity + "%");

        // appending card w/ elements
        $("#forecast").append(
          card
            .addClass("card-content forecast-content")
            .append(cardTitle)
            .append(cardIcon)
            .append(cardTemp)
            .append(cardHum)
        );
      }
    });
  }

  // function to make buttons beneath searchbar
  function makeRow(text) {
    var li = $("<a>").addClass("collection-item history").text(text);
    $(".collection").prepend(li);
  }

  // precenting anything other than numbers to be allowed in the textbox
  // source: 
  $(".numbersOnly").keyup(function () {
    this.value = this.value.replace(/[^0-9\.]/g, "");
  });

  // making buttons for each recent search input
  var history = JSON.parse(window.localStorage.getItem("history")) || [];
  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }

  // search button 'click' function
  $(".searchBtn").on("click", function () {
    var cityInput = $("#city").val(); // getting search input

    localStorage.setItem("history", JSON.stringify(history)); // setting to local storage

    history.push(cityInput); // pushing into array

    makeRow(cityInput); // making a button

    $("#forecast").empty(); // clearing previous forecast cards
    $(".location-specs").empty(); // clearing previous title card

    getCoordinates(cityInput); // getting lat & lon from zipcode

    $("#city").val(""); // clearing input text
  });

  // recent search button links
  $("a.history").on("click", function () {
    $("#forecast").empty(); // clearing previous forecast cards
    $(".location-specs").empty(); // clearing previous title card
    getCoordinates($(this).text()); // displaying new forecast & title card
  });

  getCoordinates("04070");
});
