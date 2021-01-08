var MongoClient = require("mongodb").MongoClient;

function initialize() {
	MongoClient.connect("mongodb://localhost:27017/weatherProvider", function (err, db) {
		db.createCollection("weather", function (err, coll) {
			if (err)
				error(err);
			console.log("Made weather database");
			coll.ensureIndex({"name": 1}, {unique: true}, function (err) {
				if (err)
					error(err);
				console.log("Made name a unique index for weather");
			});
			coll.ensureIndex("retrievalTime", {expireAfterSeconds: 3600}, function (err) {
				if (err) 
					error(err);
				console.log("Made one hour expiry for weather");
			});
		});
		db.createCollection("forecast", function (err, coll) {
			if (err)
				error(err);
			console.log("Made forecast database");
			coll.ensureIndex({"name": 1}, {unique: true}, function (err) {
				if (err)
					error(err);
				console.log("Made name a unique index for forecast");
			});
			coll.ensureIndex("retrievalTime", {expireAfterSeconds: 43200}, function (err) {
				if (err)
					error(err);
				console.log("Made 12 hours expiry for forecast")
			})
		});
		db.createCollection("users", function (err, coll) {
			if (err)
				error(err);
			console.log("Made users database");
			coll.ensureIndex({"username": 1}, {unique: true}, function (err) {
				if (err)
					error(err);
				console.log("Made username a unique index for users");
			});
		});
	});
}

function error (err) {
	console.log("There was an error");
	throw error;
}

initialize();
