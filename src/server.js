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

//Model
const DAO = require('./dao.js');

//For now, statid config
//TODO: make this configurable
DAO.initialise({
	sqlite: ':memory:'
});

//Controllers
const cStatic = require('./controllers/staticController.js');
const cApi = require('./controllers/apiController.js');

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

//Static content and uploads
app.route('/static/*').get(cStatic.serve);
app.route('/uploads/*').get(cStatic.serve);

/*API*/
app.route('/api/games')
	.get(cApi.getAllGames)
	.post((_, res) => res.status(405).end())
	.patch((_, res) => res.status(405).end())
	.delete((_, res) => res.status(405).end())
	.put((_, res) => res.status(405).end());

app.route('/api/game/:id')
	.get(cApi.getGame)
	.post((_, res) => res.status(405).end())
	.patch((_, res) => res.status(405).end())
	.delete((_, res) => res.status(405).end())
	.put((_, res) => res.status(405).end());

app.route('/api/boards')
	.get(cApi.getAllBoards)
	.post((_, res) => res.status(405).end())
	.patch((_, res) => res.status(405).end())
	.delete((_, res) => res.status(405).end())
	.put((_, res) => res.status(405).end());
	
app.route('/api/board/:id')
	.get(cApi.getBoard)
	.post((_, res) => res.status(405).end())
	.patch((_, res) => res.status(405).end())
	.delete((_, res) => res.status(405).end())
	.put((_, res) => res.status(405).end());

const server = app.listen(8080);
