const button = document.getElementById('paypal-button-container');

paypal
	.Buttons({
		// Sets up the transaction when a payment button is clicked
		createOrder: function () {
			return fetch('/create-order', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					items: [
						{
							id: 1,
						},
					],
				}),
			})
				.then(res => {
					if (res.ok) {
						return res.json();
					}

					return res.json().then(json => Promise.reject(json));
				})
				.then(res => {
					console.log(res);
					console.log('============');
					const id = res?.id;
					return id;
				})
				.catch(err => {
					console.dir(err.error);
				});
		},

		// Finalize the transaction after payer approval
		onApprove: function (data, actions) {
			return actions.order.capture().then(function (orderData) {
				// Successful capture! For dev/demo purposes:
				console.log(data);
				console.log(orderData);

				var transaction = orderData.purchase_units[0].payments.captures[0];
				// alert(
				// 	'Transaction ' +
				// 		transaction.status +
				// 		': ' +
				// 		transaction.id +
				// 		'\n\nSee console for all available details'
				// );

				// When ready to go live, remove the alert and show a success message within this page. For example:
				// var element = document.getElementById('paypal-button-container');
				// element.innerHTML = '';
				// element.innerHTML = '<h3>Thank you for your payment!</h3>';
				// Or go to another URL:  actions.redirect('thank_you.html');
			});
		},

		onerror: function (err) {
			console.log('=====');
			console.dir(err);
		},
	})
	.render(button);
