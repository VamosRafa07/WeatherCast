function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function main() {
	var tempGraphCx = document.getElementById("graph-temp").getContext("2d");
	var rainGraphCx = document.getElementById("graph-rain").getContext("2d");
	var windGraphCx = document.getElementById("graph-wind").getContext("2d");
	var tempMin = decodeURIComponent(getCookie("tempMin")).split(",");
	var tempMax = decodeURIComponent(getCookie("tempMax")).split(",");
	var dts = decodeURIComponent(getCookie("dt")).split(",");
	var weathers = decodeURIComponent(getCookie("weather")).split(",");
	var rains = decodeURIComponent(getCookie("rain")).split(",");
	var winds = decodeURIComponent(getCookie("wind")).split(",");

	var currentCanvas = document.getElementById("graph-temp");
	var otherCanvasses = document.querySelectorAll("canvas:not(#graph-temp)");
	var buttonArea = document.getElementById("buttons");
	var selectedButton = document.querySelector("button.pushed");
	var fadeTime = 300;

	dts = dts.map(function (dt) {
		var time = new Date(dt*1000);
		hours = time.getHours();
		minutes = "0" + time.getMinutes();
		amPm = (Math.floor(hours / 12) == 0) ? " AM" : " PM";
		hours = (hours == 0) ? "012" : "0" + String(hours % 12);
		return hours.substr(1) + ":" + minutes.substr(-2) + amPm;
	});

	tempMin = tempMin.map(function (temp) {
		return (temp - 273.15).toFixed(3);
	});

	tempMax = tempMax.map(function (temp) {
		return (temp - 273.15).toFixed(3);
	});

	function customTooltip(tooltip) {

        var tooltipEl = document.getElementById("graph-tooltip");

        if (!tooltip) {
            tooltipEl.style.opacity = 0
            return;
        }

        //tooltipEl.removeClass('above below');
        tooltipEl.className = tooltip.yAlign;

        var weath = weathers[dts.indexOf(tooltip.title)];
        weath = weath[0].toUpperCase() + weath.slice(1);
        var innerHtml = '<p class="graph-tooltip-head">' + tooltip.title + ", " + weath + '</p>';
        for (var i = tooltip.labels.length - 1; i >= 0; i--) {
        	innerHtml += [
        		'<div class="graph-tooltip-section">',
        		'	<span class="graph-tooltip-key" style="background-color:' + tooltip.legendColors[i].fill + '"></span>',
        		'	<span class="graph-tooltip-value">' + tooltip.labels[i] + '</span>',
        		'</div>'
        	].join('');
        }
        tooltipEl.innerHTML = innerHtml;

        tooltipEl.style.opacity = 1;
        tooltipEl.style.left = tooltip.chart.canvas.offsetLeft + tooltip.x + 'px';
        tooltipEl.style.top = tooltip.chart.canvas.offsetTop + tooltip.y + 'px';
        tooltipEl.style.fontFamily = tooltip.fontFamily;
        tooltipEl.style.fontSize = tooltip.fontSize;
        tooltipEl.style.fontStyle = tooltip.fontStyle;
	};

	var tempData = {
	    labels: dts,
	    datasets: [
	        {
	            label: "Maximum temperature",
	            fillColor: "rgba(255, 80, 40, 0.2)",
	            strokeColor: "rgba(255, 80, 40, 1)",
	            pointColor: "rgba(255, 80, 40, 1)",
	            pointStrokeColor: "#fff",
	            pointHighlightFill: "#fff",
	            pointHighlightStroke: "rgba(255, 80, 40, 1)",
	            data: tempMax
	        },
	        {
	            label: "Minimum temperature",
	            fillColor: "rgba(255, 165, 0, 0.3)",
	            strokeColor: "rgba(255, 165, 0, 1)",
	            pointColor: "rgba(255, 165, 0, 1)",
	            pointStrokeColor: "#fff",
	            pointHighlightFill: "#fff",
	            pointHighlightStroke: "rgba(255, 165, 0, 1)",
	            data: tempMin
	        }
	    ]
	};

	var rainData = {
		labels: dts,
		datasets: [
			{
				label: "Rain",
	            fillColor: "rgba(151,187,205,0.5)",
	            strokeColor: "rgba(151,187,205,0.8)",
	            highlightFill: "rgba(151,187,205,0.75)",
	            highlightStroke: "rgba(151,187,205,1)",
	            data: rains
			}
		]
	};

	var windData = {
		labels: dts,
		datasets: [
			{
				label: "Wind",
	            fillColor: "rgba(0,238,0,0.2)",
	            strokeColor: "rgba(0,238,0,0.5)",
	            highlightFill: "rgba(0,238,0,0.3)",
	            highlightStroke: "rgba(0,238,0,1)",
	            data: winds
			}
		]
	}

	var tempGraph = new Chart(tempGraphCx).Line(tempData, {
		scaleIntegersOnly: true,
		responsive: true,
		multiTooltipTemplate: "<%= value %>&#8451;",
		customTooltips: customTooltip,
		maintainAspectRatio: false
	});

	var rainGraph = new Chart(rainGraphCx).Bar(rainData, {
		responsive: true,
		maintainAspectRatio: false,
		barValueSpacing: 1,
		tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %> mm",
		scaleShowVerticalLines: false
	});

	var windGraph = new Chart(windGraphCx).Bar(windData, {
		responsive: true,
		maintainAspectRatio: false,
		barValueSpacing: 1,
		tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %> m/s",
		scaleShowVerticalLines: false
	});

	Array.prototype.forEach.call(otherCanvasses, function (canvas) {
		canvas.style.display = "none";
	})

	function switchDisplay(event) {
		var button = event.target;
		if (button.tagName == "BUTTON" && !/pushed/.test(button.className)) {
			selectedButton.className = "";
			button.className = "pushed";
			selectedButton = button;
			buttonArea.removeEventListener("click", switchDisplay);
			animate(function (t) {return t;}, fadeTime, function (x) {currentCanvas.style.opacity = 1 - x;}, function() {
				currentCanvas.style.display = "none";
				currentCanvas = document.querySelector("#graph-container canvas#graph-" + button.innerHTML.toLowerCase());
				currentCanvas.style.opacity = 0;
				currentCanvas.style.display = "block";
				animate(function (t) {return t;}, fadeTime, function (x) {currentCanvas.style.opacity = x;}, function() {
					buttonArea.addEventListener("click", switchDisplay);
				});
			});
		}
	}

	buttonArea.addEventListener("click", switchDisplay);

}

window.onload = main;
