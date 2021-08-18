const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const port = 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pn1pz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

client.connect((err) => {
	const productCollection = client
		.db(`${process.env.DB_NAME}`)
		.collection('products');
	const cartCollection = client.db(`${process.env.DB_NAME}`).collection('cart');

	// load all products from db
	app.get('/products', (req, res) => {
		productCollection.find({}).toArray((err, documents) => {
			res.send(documents);
		});
	});

	// load all cart products from db
	app.get('/cartProducts', (req, res) => {
		cartCollection.find({}).toArray((err, documents) => {
			res.send(documents);
		});
	});

	// add one product to db
	app.post('/addProduct', (req, res) => {
		const product = req.body;
		cartCollection
			.insertOne(product)
			.then((result) => {
				res.send(result.acknowledged);
			})
			.catch((err) => {
				console.log(err.code);
			});
	});

	// delete product from db
	app.delete('/delete/:id', (req, res) => {
		cartCollection.deleteOne({ _id: req.params.id }).then((result) => {
			res.send(result.deletedCount > 0);
		});
	});
});

// root
app.get('/', (req, res) => {
	res.send('Hello Fresh Valley server!');
});

app.listen(process.env.PORT || port);
