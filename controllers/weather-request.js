module.exports = function (queryPath, callback) {
    var req = require("http").get({
        host: "api.openweathermap.org",
        path: queryPath + "&APPID=4c89eca97167a5e96c100573eff4b6dc",
        //headers: {'User-Agent':'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)'}
        }, function (response) {
            if (response.statusCode <= 200) {
                var data = "";
                response.setEncoding("utf8");

                response.on("data", function (chunk) {
                    data += chunk;
                });

                response.on("end", function () {
                    callback("", JSON.parse(data));
                });
            }

            else
                callback(new Error("Resource not found"));
        }
    );

    req.on("error", function () {
        callback(new Error("Resource not found"));
    });

    req.end();
}
