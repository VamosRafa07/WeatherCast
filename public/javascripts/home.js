function main() {
	var curPane = document.querySelector("#search-pane");
	var curButton = document.querySelector("#search-button");
	var otherButton = document.querySelector("#history-button");
	var buttonArea = document.querySelector("#header-button-area");
	var fadeTime = 300;

	function switchPane(event) {
		var button = event.target.parentNode;
		if (/button-header/.test(button.className) && !/current/.test(button.className)) {
			curButton.className = curButton.className.replace(" current", "");
			button.className += " current";
			curButton = button;
			buttonArea.removeEventListener("click", switchPane);
			animate(function (t) {return t;}, fadeTime, function (x) {curPane.style.opacity = 1 - x;}, function() {
				curPane.style.display = "none";
				curPane = document.querySelector("div#" + button.id.slice(0, -7) + "-pane");
				curPane.style.opacity = 0;
				curPane.style.display = "block";
				animate(function (t) {return t;}, fadeTime, function (x) {curPane.style.opacity = x;}, function() {
					buttonArea.addEventListener("click", switchPane);
				});
			});
		}
	}

	buttonArea.addEventListener("click", switchPane);
}

window.onload = main;
