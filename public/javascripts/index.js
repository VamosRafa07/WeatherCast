function animate(xfromt, duration, xToProperty, callback) {
	var t0 = new Date;

	var _animate = setInterval(function () {
		var t = (new Date - t0)/duration;				
		if (t>1)
			t=1;

		var x = xfromt(t);

		xToProperty(x);
		
		if (t==1) {
			clearInterval(_animate);
			callback();
		}
	}, 10);
}


function main() {
	var passwordInputsRegister = document.querySelectorAll("form#register input[type=\"password\"]");
	var invisibleSwitcher = document.querySelector("#switch-form #switch-login");
	var currentForm = document.querySelector("form#login");
	var buttonArea = document.querySelector("#switch-form");
	var userNameRegister = document.querySelector("form#register input[type=\"text\"]");

	function switchForm(event) {
		var button = event.target;
		if (button.tagName == "BUTTON" && !/invisible/.test(button.className)) {
			invisibleSwitcher.className = "";
			button.parentNode.className = "invisible";
			invisibleSwitcher = button.parentNode;
			currentForm.style.display = "none";
			currentForm = document.querySelector("form#" + button.innerHTML.slice(0, button.innerHTML.length - 1).toLowerCase());
			currentForm.style.display = "block";
		}
	}

	function validateUserNameRegister(event) {
		var userName = event.target.value;
		if (event.target.validity.patternMismatch)
			event.target.setCustomValidity("Only alphabets, numbers, underscores and periods are allowed");
		else if (!event.target.validity.patternMismatch) {
			event.target.setCustomValidity("");
			var req = new XMLHttpRequest();
			req.open("GET", "/check?user=" + userName, true);
			req.addEventListener("load", function() {
				if (req.status < 400) {
					console.log("hey");
					if (req.responseText == "Existing name exists")
						event.target.setCustomValidity("This username has already been taken!");
					else
						event.target.setCustomValidity("");
				}
			});
			req.send(null);
		}
	}

	function validatePasswordRegister(event) {
		if (event.target.validity.patternMismatch)
			passwordInputsRegister[0].setCustomValidity("Only alphabets, numbers, underscores and periods are allowed");
		else if (passwordInputsRegister[0].value != passwordInputsRegister[1].value)
			passwordInputsRegister[1].setCustomValidity("Both passwords should be the same");
		else {
			passwordInputsRegister[0].setCustomValidity("");
			passwordInputsRegister[1].setCustomValidity("");
		}
	}

	userNameRegister.addEventListener("keyup", validateUserNameRegister);
	buttonArea.addEventListener("click", switchForm);
	passwordInputsRegister[0].addEventListener("keyup", validatePasswordRegister);
	passwordInputsRegister[1].addEventListener("keyup", validatePasswordRegister);
}

function formRegisterSubmit() {
	var registerForm = document.querySelector("form#register");
	registerForm.removeChild(document.querySelectorAll("form#register input[type=\"password\"]")[1]);
	return true;
}

window.onload = main;
