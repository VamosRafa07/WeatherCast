# WeatherCast
================

A web application to provide the current weather and 24 hour forecast of almost any city.


Build Instructions
------------------

Install Node and MongoDB on your system, and place all the files in any folder. Using Node's package manager npm, install all
the dependencies mentioned below. They should go into the node_modules folder inside the working directory. Also, download the Chart.js module and place the file Chart.js in /public/javascripts. From the weather icons repository, place the font folder inside /public, and place weather-icons.css (inside the css folder in the repo) inside /public/stylesheets. Now, run the script entitled `first-time.js` (`node first-time.js`). This sets up the database on your system. Finally, run server.js.

Usage
-----

**Note**: This app runs on port 3000.  

Simply visit the root page while the server is running, i.e., if the server is running on your own machine, localhost:3000 gets you
to the login page. Note that the time shown on the weather page is the time when the information was collected by the API, **not the
current time**. All times displayed in the site are converted to the time zone your device uses.


Routes
------

* /: Login page.
* /login: Posting login information.
* /register: Posting registration information.
* /login/retry: If login did not succeed, the user is redirected to this page to retry.
* /check: To check if the username exists. This is used in the registration form.
* /users: The home page after logging in. Mounted on users are the following paths:
	* /search: Posting search parameters.
	* /weather?city=&lt;cityname&gt;: Search redirects here if the weather of a city is requested.
	* /forecast?city=&lt;cityname&gt;: Search redirects here if the forecast of a city is requested.

Collections
-----------

On running the initialization script, a database named `weatherProvider` with three collections are created: `weather`, `forecast` and
`users`. `weather` and `forecast` store information retrieved from the API about the weathers and forecasts respectively of the cities
searched for by users. Each document in `weather` expires in an hour and the ones in `forecast` expire in 12 hours. The `users` collection stores the usernames, passwords (hashed) and search histories of each user in separate documents.

Links
-----

* [Node](http://www.nodejs.org)
* [MongoDB](http://www.mongodb.org)

###Documentation for dependencies

* [Express.js](http://www.expressjs.com): A framework for Node.
* [MongoDB Node driver](http://mongodb.github.io/node-mongodb-native): The Node driver for the MongoDB database.
* [Body parser](https://github.com/expressjs/body-parser): Parses requests.
* [Embedded JS](http://www.embeddedjs.com): A view engine that uses embedded javascript.
* [Express session](https://github.com/expressjs/session): Enables session handling.
* [Path](https://nodejs.org/api/path.html): Handles and transforms file and folder paths.
* [sha1](https://www.npmjs.com/package/sha1): Hashing module. Uses the SHA1 algorithm.
* [Chart.js](http://www.chartjs.org): A module for making charts quickly.
* [Weather icons](https://github.com/erikflowers/weather-icons): A CSS module for simple weather icons.
