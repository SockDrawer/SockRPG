'use strict';

/**
 * Server module; primarily used for routing requests to the appropriate controller.
 *
 * @module server
 * @license MIT
 * @author RaceProUK
 */

const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const bodyParser = require('body-parser');
const debug = require('debug')('server');


//Model
const DAO = require('./dao.js');

//Controllers
const cStatic = require('./controllers/staticController.js');
const cApi = require('./controllers/apiController.js');
const cPage = require('./controllers/pageController.js');

//Views
const hbs = exphbs.create({
	defaultLayout: 'main',
	layoutsDir: 'src/views/layouts',
	partialsDir: 'src/views/partials'
});

function setupDao() {
	debug('Initializing dao');
	//For now, static config
	//TODO: make this configurable
	return DAO.initialise({
		sqlite: 'sampleData.sqlite'
	}).then(() => {
		if (!DAO.isInitialised()) {
			console.log('Initialization error');
			process.exit(1);
		}
	});
}

function setupExpress() {
	debug('Initializing Express');
	return new Promise(
		(resolve, reject) => {
			app.engine('handlebars', hbs.engine);
			app.set('view engine', 'handlebars');
			app.set('views', 'src/views');
			
			
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
			
			/*Pages*/
			app.route('/')
				.get(cPage.getHomePage);
			
			const jsonParser = bodyParser.json({type: 'application/json'});
			/*API*/
			app.route('/api/games')
				.get(cApi.getAllGames)
				.post(jsonParser, cApi.addGame)
				.patch(return405)
				.delete(return405)
				.put(return405);
			
			app.route('/api/games/:id')
				.get(cApi.getGame)
				.post(return405)
				.patch(return405)
				.delete(return405)
				.put(jsonParser, cApi.updateGame);
			
			app.route('/api/boards')
				.get(cApi.getAllBoards)
				.post(jsonParser, cApi.addBoard)
				.patch(return405)
				.delete(return405)
				.put(return405);
			
			app.route('/api/boards/:id')
				.get(cApi.getBoard)
				.post(return405)
				.patch(return405)
				.delete(return405)
				.put(jsonParser, cApi.updateBoard);
			
			resolve();
		});
}

function setup() {
	return setupDao().then(() => setupExpress()).then(() => {
		const server = app.listen(8080);
		console.log('Server now listening on port 8080');
	})
}


/**
 * Returns a vanilla 405 Method Not Allowed error
 * @param {Object} _ Ignored
 * @param {Object} res An Express response object
 */
function return405(_, res) {
	res.status(405).end();
}

module.exports =  {
	setup: setup
};

if (require.main === module) {
    setup();
}