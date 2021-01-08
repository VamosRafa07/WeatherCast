var initdb = require("./initdb")

function checkDB(collName, query, callback) {
	var db = initdb.db();

	if (collName == "weather") {
		weatherColl = db.collection("weather");
		weatherColl.findOne({"name": query}, function (err, data) {
			if (err) {
				callback(err);
				return;
			}
			else if (!data) {
				callback(new Error("No entry exists!"));
				return;
			}
			else {
				callback("", data);
			}
		});
	}
	else if (collName == "forecast") {
		forecastColl = db.collection("forecast");
		forecastColl.findOne({"name": query}, function (err, data) {
			if (err) {
				callback(err);
				return;
			}
			else if (!data)
				return callback(new Error("No good entries"));
			else {
				startFromHere = checkForecastData(data);
				if (!startFromHere) {
					forecastColl.remove({"name": query});
					return callback(new Error("No good entries"));
				}
				else {
					data.startFrom = startFromHere;
					return callback("", data);
				}
			}
		});
	}
	else if (collName == "users") {
		usersColl = db.collection("users");
		usersColl.findOne({"username": query}, function (err, data) {
			if (err)
				return callback(err);
			else if (data) {
				return callback(new Error("Existing name exists"));
			}
			else
				return callback("");
		})
	}
	return;
}

function checkForecastData(data) {
	var dateNow = new Date;
	var i;
	var valid = true, flag = true;
	for (i = 0; flag; ++i) {
		if (dateNow < new Date(data.dt[i+1]*1000)) {
			startFromHere = i + 1;
			flag = false;
		}
	}
	if (flag || startFromHere + 8 >= data.dt.length)
		return "";
	else
		return startFromHere;
}

module.exports = checkDB;
