var express = require("express")
var initdb = require("../controllers/initdb");
var checkDB = require("../controllers/checkdb");
var session = require("express-session");
var path = require("path");
var sha1 = require("sha1");
var router = express.Router();

router.get("/logout", function (req, res, next) {
	req.session.destroy();
	res.redirect("/");
})

router.get("/", function (req, res, next) {
	res.sendFile(path.join(__dirname + "/../public/home.html"), {"headers": {"cache-control": " no-cache, max-age=0, must-revalidate, no-store"}});
});

router.get("/check", function (req, res, next) {
	if(req.query.user) {
		checkDB("users", req.query.user, function (err) {
			if(err) {
				if (err.message == "Existing name exists")
					res.send("Existing name exists");
				else
					res.send(err);
			}
			else
				res.send("All's cool!");
		});
	}
});

router.post("/login", function (req, res, next) {
	if (!/^[0-9a-zA-Z_.]+$/.test(req.body["username"])) {
		res.redirect("/login/retry");
		req.session["login"] = "No user";
		req.session.save();
		return next();
	}
	db = initdb.db();
	usersColl = db.collection("users");
	usersColl.findOne({"username": req.body["username"]}, function (err, data) {
		if (err)
			return next(new Error("Internal server error"));
		else if (!data) {
			res.redirect("/login/retry");
			req.session["login"] = "No user";
			req.session.save();
		}
		else {
			if (data["password"] != sha1(req.body["password"]) || !/^[0-9a-zA-Z_.]+$/.test(req.body["password"])) {
				res.redirect("/login/retry");
				req.session["login"] = "Wrong password";
				req.session.save();
			}
			else {
				res.redirect("/users");
				req.session["login"] = "Logged in";
				req.session["username"] = data["username"];
				req.session.save();
				next();
			}
		}
	});
	return;
});

router.get("/login/retry", function (req, res, next) {
	if (req.session["login"] == "Logged in")
		return res.redirect("/users");
	res.setHeader("cache-control", " no-cache, max-age=0, must-revalidate, no-store");
	if (req.session["login"] == "No user")
		res.render("error-login", {errorMessage: "User does not exist"});
	else if(req.session["login"] == "Wrong password")
		res.render("error-login", {errorMessage: "Wrong password"});
});

router.post("/register", function (req, res, next) {
	function validateRegistration() {
		var data = req.body;
		if (!data["username"] || !data["password"] || Object.keys(data).length > 2) {
			return next(new Error("Invalid fields"));
		}
		if (!/^[0-9a-zA-Z_.]+$/.test(data["username"]) || data["username"].length > 50) {
			return next(new Error("Invalid username"));
		}
		if (data["password"].length > 32) {
			return next(new Error("Invalid password"));
		}
		return true;
	}

	data = req.body;
	db = initdb.db();
	usersColl = db.collection("users");
	if(validateRegistration()) {
		data.searches = [];
		data.password = sha1(data.password);
		usersColl.insert(data, {w: 1}, function (err) {
			if (err)
				return next(new Error("Username exists"));
		});
		req.session["login"] = "Logged in";
		req.session["username"] = data["username"];
		req.session.save();
		res.redirect("/users");
	}
});

module.exports = router;
