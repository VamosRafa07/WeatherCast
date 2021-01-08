var express = require("express");
var weatherRequest = require("../controllers/weather-request.js");
var iconMapping = require("../controllers/weather-mapping.js");
var checkDB = require("../controllers/checkdb");
var initdb = require("../controllers/initdb");
var session = require("express-session");
var router = express.Router();
var queryPathPrefix = "/data/2.5";

var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var hours, minutes;

router.get("/*", function (req, res, next) {
	res.setHeader("cache-control", " no-cache, max-age=0, must-revalidate, no-store");
	if (req.session["login"] != "Logged in")
		return next(new Error("Permission denied"));
	else
		next();
});

router.get("/", function (req, res, next) {
	db = initdb.db();
	usersColl = db.collection("users");
	usersColl.findOne({"username": req.session["username"]}, function (err, data) {
		if (err)
			return next(err);
		res.render("home", {"username": data.username, "searches": data.searches});
	})
});

router.get("/search", function (req, res, next) {
	if (!req.query.city || !req.query["search-type"])
		return next(new Error("Improper query"));
	if (["forecast", "weather"].indexOf(req.query["search-type"]) == -1)
		return next(new Error("Improper query"));
	res.redirect(req.query["search-type"] + "?city=" + req.query.city);
});

router.get("/weather", function (req, res, next) {
	var db = initdb.db();

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
					if (!data.name)
						return next(new Error("The city you searched for does not exist"));
					updateHistory(req, data.name, "weather");
					data.name = data.name.toLowerCase();
					data.retrievalTime = new Date;
					db.collection("weather").insert(data);
					renderWeatherPage(err, data);
				});
				return;
			}
			else
				return next(err);
		}
		else {
			renderWeatherPage("", data);
			updateHistory(req, data.name, "weather");
		}
	});
});

router.get("/forecast", function (req, res, next) {
	db = initdb.db();

	function mapForecastData(data) {
		if (!data.list || !data.city.name)
			return next((data.message) ? new Error(data.message) : new Error("City not found"));
		var newData = {tempMin: [], tempMax: [], dt: [], weather: [], rain: [], windSpeed: []};
		var i, count;
		newData.name = data.city.name.toLowerCase();
		for (i = 0; i < data.list.length; i++) {
			newData.tempMin[i] = data.list[i].main.temp_min;
			newData.tempMax[i] = data.list[i].main.temp_max;
			newData.dt[i] = data.list[i].dt;
			newData.weather[i] = data.list[i].weather[0].description;
			newData.rain[i] = (data.list[i].rain) ? data.list[i].rain["3h"] : 0;
			newData.windSpeed[i] = data.list[i].wind.speed;
		}	
		return newData;
	}

	function renderForecastPage(err, data) {
		if (err)
			return next(new Error(err));
		startFrom = data.startFrom || 1;
		res.cookie("tempMin", data.tempMin.slice(startFrom, startFrom + 9).join(","));
		res.cookie("tempMax", data.tempMax.slice(startFrom, startFrom + 9).join(","));
		res.cookie("dt", data.dt.slice(startFrom, startFrom + 9).join(","));
		res.cookie("weather", data.weather.slice(startFrom, startFrom + 9).join(","));
		res.cookie("rain", data.rain.slice(startFrom, startFrom + 9).join(","));
		res.cookie("wind", data.windSpeed.slice(startFrom, startFrom + 9).join(","));
		res.render("forecast", {name: data.name});
	}

	if (!req.query.city)
		return next(new Error("Improper query"));
	var queryPath = queryPathPrefix + "/forecast" + "?q=" + encodeURIComponent(req.query.city);
	checkDB("forecast", req.query.city.toLowerCase(), function (err, data) {
		if (err) {
			if (err.message == "No good entries") {
				weatherRequest(queryPath, function (err, data) {
					if (err)
						return next(err);
					if (!data.city)
						return next(new Error("The city you searched for does not exist"));
					if (!data.city.name)
						return next(new Error("The city you searched for does not exist"));
					updateHistory(req, data.city.name, "forecast");
					data = mapForecastData(data);
					renderForecastPage(err, data);
					data.retrievalTime = new Date;
					db.collection("forecast").insert(data);
				});
			}
			else
				return next(err);
		}
		else {
			renderForecastPage("", data);
			updateHistory(req, data.name, "forecast")
		}
	});
});

function updateHistory(req, city, searchType) {
	db = initdb.db();
	usersColl = db.collection("users");
	usersColl.findOne({"username": req.session["username"]}, function (err, data)  {
		if (err)
			return next(err);
		var searches = data.searches;
		var newSearch = {"city": city.toLowerCase(), "searchType": searchType};
		if (searches.filter(function (obj) {return obj.city == newSearch.city && obj.searchType == newSearch.searchType}).length == 0) {
			searches.push(newSearch);
			usersColl.update({"username": req.session["username"]}, {$set: {"searches": searches}});
		}
	});
}

module.exports = router;
