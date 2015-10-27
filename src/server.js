'use strict';

/**
 * Server module; primarily used for routing requests to the appropriate controller.
 *
 * @module server
 * @license MIT
 * @author RaceProUK
 */

const express = require('express');
const app = express();

app.route('/')
	.get((req, res) => {
		res.send('Dude, where\'s my forum?');
	});

//This is purely an example to show how the routing will be implemented for each endpoint
//Any unsupported methods will be omitted
app.route('/example')
	.get((req, res) => {
		res.send('GETs will read things!');
	})
	.post((req, res) => {
		res.send('POSTs will create things!');
	})
	.put((req, res) => {
		res.send('PUTs will edit things!');
	})
	.delete((req, res) => {
		res.send('Danger Will Robinson!');
	});

const server = app.listen(8080);
