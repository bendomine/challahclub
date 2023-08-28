// IMPORTANT!! If you change the Google script, you'll need to re-deploy it and replace the url below with the new one.
const FORM_URL =
	'https://script.google.com/macros/s/AKfycbyzN1n2BywIIjrdvLAFnPbuxfFmH3Cw-iG5Pwef_Op55RgtVETuVP-OMMfWYmozmU6sbg/exec';

let request;

// This just updates the little number next to the submit box to display the price of the order.
document.getElementById('orderForm').oninput = () => {
	let formValues = document.getElementById('orderForm').elements;
	let price =
		6.75 *
		(+formValues.numPlain.value + +formValues.numSesame.value + +formValues.numPoppy.value);
	document.getElementById('costLabel').innerText =
		'Order cost: $' + (price == 0 ? '0.00' : price);
};

// This triggers when we submit the order form.
document.getElementById('orderForm').onsubmit = function (event) {
	// Boilerplate to prevent page redirects and other default browser form submit things.
	event.preventDefault();

	// This disables every element in the form so they can't be edited until we receive confirmation from the server.
	for (let i = 0; i < document.getElementById('orderForm').elements.length; ++i) {
		document.getElementById('orderForm').elements[i].disabled = true;
	}

	// This stops any old requests.
	if (request) {
		request.abort();
	}

	let formValues = document.getElementById('orderForm').elements;

	// Basically just creates a new AJAX request and sends it to the server with the parameters from the form.
	request = new XMLHttpRequest();
	request.open(
		'GET',
		FORM_URL +
			`?email=${formValues.email.value}` +
			`&numPlain=${formValues.numPlain.value}` +
			`&numSesame=${formValues.numSesame.value}` +
			`&numPoppy=${formValues.numPoppy.value}` +
			`&isForStaff=${formValues.isForStaff.checked}` +
			`&payMethod=${formValues.payMethod.value}` +
			`&comment=${formValues.comment.value}`
	);
	request.send();

	// This runs as soon as we get confirmation from the server that the request was received.
	// In this case, request.responseText will hold whatever the server returned.
	request.onload = (e) => {
		let response = JSON.parse(request.responseText);

		if (response.success) {
			// If we had everything successful, this displays a confirmation window.
			document.getElementById('orderSuccessBack').style.display = 'block';
			document.getElementById('paymentText').innerText =
				'Payment: $' +
				6.75 *
					(+formValues.numPlain.value +
						+formValues.numSesame.value +
						+formValues.numPoppy.value);
			if (formValues.payMethod.value == 'InPerson')
				document.getElementById('paymentText').innerText += ', to be paid in person.';
			else
				document.getElementById('paymentText').innerText += ', to @abby-domine via PayPal.';
		} else {
			// If instead there was a failure, this will display an error window with the error message
			//		returned by the server.
			document.getElementById('orderFailBack').style.display = 'block';
			document.getElementById('errorText').innerText =
				response.error.type + ': ' + response.error.message + '.';
		}

		// This re-enables and clears the form.
		for (let i = 0; i < document.getElementById('orderForm').elements.length; ++i) {
			document.getElementById('orderForm').elements[i].disabled = false;
		}
		document.getElementById('orderForm').reset();
	};
};
