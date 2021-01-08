function events() {
	var buttonArea = document.getElementById("buttons");
	var extraInfoContainer = document.querySelector("div#text-extra");
	var extraInfoCurrentDiv = document.querySelector("div#text-extra div#text-temp");
	var selectedButton = document.querySelector("button.pushed");
	var fadeTime = 300;

	function switchDisplay(event) {
		var button = event.target;
		if (button.tagName == "BUTTON" && !/pushed/.test(button.className)) {
			selectedButton.className = "";
			button.className = "pushed";
			selectedButton = button;
			buttonArea.removeEventListener("click", switchDisplay);
			animate(function (t) {return t;}, fadeTime, function (x) {extraInfoCurrentDiv.style.opacity = 1 - x;}, function() {
				extraInfoCurrentDiv.style.display = "none";
				extraInfoCurrentDiv = document.querySelector("div#text-extra div#text-" + button.innerHTML.toLowerCase());
				extraInfoCurrentDiv.style.opacity = 0;
				extraInfoCurrentDiv.style.display = "block";
				animate(function (t) {return t;}, fadeTime, function (x) {extraInfoCurrentDiv.style.opacity = x;}, function() {
					buttonArea.addEventListener("click", switchDisplay);
				});
			});
		}
	}

	buttonArea.addEventListener("click", switchDisplay);
}

window.onload = events;
