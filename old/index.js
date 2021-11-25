const express = require('express');
const paypal = require('paypal-rest-sdk');
require('dotenv').config();

// const router = express.Router();

paypal.configure({
	mode: process.env.PAYPAL_MODE,
	client_id: process.env.PAYPAL_CLIENT_ID,
	client_secret: process.env.PAYPAL_SECRET_ID,
});

const app = express();
const PORT = 3000 || process.env.PORT;

app.get('/', (_, res) => res.sendFile(__dirname + '/public/index.html'));

app.post('/pay', (req, res) => {
	const create_payment_json = {
		intent: 'sale',
		payer: {
			payment_method: 'paypal',
		},
		redirect_urls: {
			return_url: 'http://localhost:3000/success',
			cancel_url: 'http://localhost:3000/cancel',
		},
		transactions: [
			{
				item_list: {
					items: [
						{
							name: 'Redhock Bar Soap',
							sku: '001',
							price: '25.00',
							currency: 'USD',
							quantity: 1,
						},
					],
				},
				amount: {
					currency: 'USD',
					total: '25.00',
				},
				description: 'Washing Bar soap',
			},
		],
	};

	return paypal.payment.create(create_payment_json, function (error, payment) {
		if (error) {
			throw error;
		} else {
			console.log('Create Payment Response');
			console.log(payment);
		}

		return res.send('good').status(200);
	});

	// paypal.payment.create(create_payment_json, function (error, payment) {
	// 	if (error) {
	// 		throw error;
	// 	} else {
	// 		for (let i = 0; i < payment.links.length; i++) {
	// 			if (payment.links[i].rel === 'approval_url') {
	// 				console.log(payment.links);
	// 				// res.redirect(payment.links[i].href);
	// 			}
	// 		}
	// 	}
	// });
});

app.get('/success', (req, res) => {
	const payerId = req.query.PayerID;
	const paymentId = req.query.paymentId;

	const execute_payment_json = {
		payer_id: payerId,
		transactions: [
			{
				amount: {
					currency: 'USD',
					total: '25.00',
				},
			},
		],
	};

	// Obtains the transaction details from paypal
	paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
		//When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
		if (error) {
			console.log(error.response);
			throw error;
		} else {
			console.log(JSON.stringify(payment));
			res.send('Success');
		}
	});
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(PORT, () => console.log(`Server Started on ${PORT}`));

// class UserController {
// 	saveAll() {}
// }

// function getNameAndClass(className, methodName) {
// 	const classN = className?.name;
// 	const methodN = Object.getOwnPropertyDescriptors(methodName)?.name?.value;
// 	return [classN, methodN];
// }

// console.log(getNameAndClass(UserController, UserController.prototype.saveAll));
