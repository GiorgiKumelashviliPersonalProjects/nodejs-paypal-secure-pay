const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

const app = express();
const paypal = require('@paypal/checkout-server-sdk');
dotenv.config();

const configs = {
	port: process.env.PORT || 3000,
	paypalMode: process.env.PAYPAL_MODE,
	paypalClientID: process.env.PAYPAL_CLIENT_ID,
	paypalSecretID: process.env.PAYPAL_SECRET_ID,
};

app.set('view engine', 'ejs');
app.set('views', __dirname + '/resources/views');
app.use(express.static(path.join(__dirname + '/resources')));
app.use(express.json());

const Enviroment =
	process.env.NODE_ENV === 'production' ? paypal.core.LiveEnvironment : paypal.core.SandboxEnvironment;

const paypalClient = new paypal.core.PayPalHttpClient(
	new Enviroment(configs.paypalClientID, configs.paypalSecretID)
);

const Packets = new Map([
	[1, { price: 10, name: 'standart' }],
	[2, { price: 100, name: 'premium' }],
]);

app.get('/', (req, res) => {
	res.render('index', {
		paypalClientID: configs.paypalClientID,
	});
});

app.post('/create-order', async (req, res) => {
	const request = new paypal.orders.OrdersCreateRequest();
	const items = req.body?.items;

	if (!items) {
		return null;
	}

	const total = items.reduce((sum, item) => {
		return sum + Packets.get(item.id).price;
	}, 0);

	// request.headers['prefer'] = 'return=representation';
	request.prefer('return=representation');

	request.requestBody({
		intent: 'CAPTURE',
		purchase_units: [
			{
				amount: {
					currency_code: 'USD',
					value: total,
					breakdown: {
						item_total: {
							currency_code: 'USD',
							value: total,
						},
					},
				},
				items: items.map(item => {
					const packet = Packets.get(item.id);

					// item detail(s)
					return {
						name: packet.name,
						unit_amount: {
							currency_code: 'USD',
							value: packet.price,
						},
						quantity: 1,
					};
				}),
			},
		],
	});

	try {
		const order = await paypalClient.execute(request);
		console.log(order);
		res.json({ id: order.result.id });
	} catch (error) {
		res.status(500).json({
			err: error,
		});
	}
});

app.listen(configs.port, () => console.log(`Server Started on ${configs.port}`));
