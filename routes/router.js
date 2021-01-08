var express = require("express");
var weatherRequest = require("../controllers/weather-request.js");
var iconMapping = require("../controllers/weather-mapping.js");
var checkDB = require("../controllers/checkdb");
var MongoClient = require("mongodb").MongoClient;
var router = express.Router();
var queryPathPrefix = "/data/2.5";

var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var hours, minutes;

router.get("/weather", function (req, res, next) {

	function renderWeatherPage(err, data) {
		if (err){
			return next(new Error(err));
		}
		else if (!data.weather || !data.name)
			res.send(data.message || "City not found");
		else {
			var time = new Date(data.dt*1000);
			hours = time.getHours();
			minutes = "0" + time.getMinutes();
			amPm = (Math.floor(hours / 12) == 0) ? " AM" : " PM";
			hours = (hours == 0) ? "012" : "0" + String(hours % 12);
			time = days[time.getDay()] + " " + hours.substr(1) + ":" + minutes.substr(-2) + amPm;
			res.render("weather", {
				"iconName": iconMapping[data.weather[0].icon],
				"city": data.name,
				"time": time,
				"weatherDescription": data.weather[0].description,
				"temperature": data.main.temp,
				"maxTemperature": data.main.temp_max,
				"minTemperature": data.main.temp_min,
				"humidity": data.main.humidity,
				"rain": (data.rain) ? data.rain["3h"] : 0,
				"snow": (data.snow) ? data.snow["3h"] : 0,
				"windSpeed": data.wind.speed,
				"gustSpeed": data.wind.gust,
				"windDirection": data.wind.deg,
				"pressure": data.main.pressure
			});
		}
	}

	if (!req.query.city)
		return next(new Error("Improper query"));
	var queryPath = queryPathPrefix + "/weather" + "?q=" + encodeURIComponent(req.query.city);
	checkDB("weather", req.query.city.toLowerCase(), function (err, data) {
		if (err) {
			if (err.message == "No entry exists!") {
				weatherRequest(queryPath, function (err, data) {
					if (err)
						return next(err);
					MongoClient.connect("mongodb://localhost:27017/weatherProvider", function (err, db) {
						data.name = data.name.toLowerCase();
						db.collection("weather").insert(data);
					});
					renderWeatherPage(err, data);
				});
				return;
			}
			else
				return next(err);
		}
		else {
			renderWeatherPage("", data);
		}
	});
});

router.get("/forecast", function (req, res, next) {

	function filterForecastData(data) {
		var newData = {tempMin: [], tempMax: [], dt: [], weather: [], rain: [], windSpeed: []};
		var startFrom = 1;
		var i, count;
		newData.city = data.city.name;
		for (i = startFrom, count = 0; count < 9; count++, i++) {
			newData.tempMin[count] = data.list[i].main.temp_min;
			newData.tempMax[count] = data.list[i].main.temp_max;
			newData.dt[count] = data.list[i].dt;
			newData.weather[count] = data.list[i].weather[0].description;
			newData.rain[count] = (data.list[i].rain) ? data.list[i].rain["3h"] : 0;
			newData.windSpeed[count] = data.list[i].wind.speed;
		}
		return newData;
	}

	function renderForecastPage(err, data) {
		if (err){
			return next(new Error(err));
		}
		else if (!data.list || !data.city.name) {
			res.send(data.message || "City not found");
			return;
		}
		data = filterForecastData(data);
		res.cookie("tempMin", data.tempMin.join(","));
		res.cookie("tempMax", data.tempMax.join(","));
		res.cookie("dt", data.dt.join(","));
		res.cookie("weather", data.weather.join(","));
		res.cookie("rain", data.rain.join(","));
		res.cookie("wind", data.windSpeed.join(","));
		res.render("forecast", {});
	}

	if (!req.query.city)
		return next(new Error("Improper query"));
	var queryPath = queryPathPrefix + "/forecast" + "?q=" + encodeURIComponent(req.query.city);
	weatherRequest(queryPath, renderForecastPage);
})

module.exports = router;
