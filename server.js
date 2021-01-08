var express = require("express");
var routerWeather = require("./routes/router-weather");
var routerLogin = require("./routes/router-login");
var bodyParser = require("body-parser");
var session = require("express-session");
var initdb = require("./controllers/initdb");
require("./controllers/initdb");
var app = express();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(session({secret: "keyboard-cat", saveUninitialized: true, resave: false}));
app.use(bodyParser.urlencoded({extended: false}));
app.get("/", function (req, res, next) {
	if (req.session["login"] == "Logged in")
		res.redirect("/users");
	return next();
});
app.use(express.static(__dirname + "/public"));
app.use(routerLogin);
app.use("/users", routerWeather);
app.use(function (err, req, res, next) {
	res.send(err.message);
});
app.listen(3000);
