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
const DB = require('./model/db');

//Controllers
const cStatic = require('./controllers/staticController.js');
const cBoard = require('./controllers/boardController.js');
const cThread = require('./controllers/threadController.js');
const cPost = require('./controllers/postController.js');
const cPage = require('./controllers/pageController.js');
const cUser = require('./controllers/userController.js');

//Views
const hbs = exphbs.create({
	defaultLayout: 'main',
	layoutsDir: 'src/views/layouts',
	partialsDir: 'src/views/partials'
});

let server;

/**
 * Initialise the DAO
 * @param {Object} config The configuration object to use
 * @returns {Promise} A promise chain that resolves when the DAO is ready to use
 */
function setupDao(config) {
	debug('Initializing dao');
	//For now, static config
	//TODO: make this configurable
	return DB.initialise(config).then(() => {
		if (!DB.isInitialised()) {
			console.log('Initialization error');
			process.exit(1);
		}
	});
}

/**
 * Initialise the Express server
 * @returns {Promise} A promise chain that resolves when the server is ready to use
 */
function setupExpress() {
	debug('Initializing Express');
	return new Promise(
		(resolve) => {
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
			app.route('/board/:id')
				.get(cPage.getBoardView);
			app.route('/thread/:id')
				.get(cPage.getThreadView);
			
			const jsonParser = bodyParser.json({type: 'application/json'});
			/*API*/
			app.route('/api/games')
				.get(cBoard.getAllGames)
				.post(jsonParser, cBoard.addGame)
				.patch(return405)
				.delete(return405)
				.put(return405);
			
			app.route('/api/games/:id')
				.get(cBoard.getGame)
				.post(return405)
				.patch(return405)
				.delete(return405)
				.put(jsonParser, cBoard.updateGame);
			
			app.route('/api/boards')
				.get(cBoard.getAllBoards)
				.post(jsonParser, cBoard.addBoard)
				.patch(return405)
				.delete(return405)
				.put(return405);
			
			app.route('/api/boards/:id')
				.get(cBoard.getBoard)
				.post(return405)
				.patch(return405)
				.delete(return405)
				.put(jsonParser, cBoard.updateBoard);
				
			app.route('/api/boards/:id/threads')
				.get(cThread.getThreadsForBoard)
				.post(jsonParser, cThread.addThreadToBoard)
				.patch(return405)
				.delete(return405)
				.put(jsonParser, cPost.addPost);
				
			app.route('/api/users')
				.get(cUser.getAllUsers)
				.post(jsonParser, cUser.addUser)
				.patch(return405)
				.delete(return405)
				.put(return405);
			
			app.route('/api/users/:id')
				.get(cUser.getUser)
				.post(return405)
				.patch(return405)
				.delete(return405)
				.put(jsonParser, cUser.updateUser);
			
			app.route('/api/threads/:id')
				.get(cThread.getThread)
				.post(return405)
				.patch(return405)
				.delete(return405)
				.put(jsonParser, cPost.addPost);
				
			resolve();
		});
}

/**
 * Initialise the server
 * @param {Object} config The configuration object to use
 * @returns {Promise} A promise chain that resolves when the server is running
 */
function setup(config) {
	return setupDao(config).then(() => setupExpress()).then(() => {
		server = app.listen(8080);
		console.log('Server now listening on port 8080');
	});
}

/**
 * Stop the server
 */
function stop() {
	server.close();
	console.log('Server stopped');
}
/**
 * Returns a vanilla 405 Method Not Allowed error
 * @param {Object} _ Ignored
 * @param {Object} res An Express response object
 */
function return405(_, res) {
	res.status(405).end();
}

module.exports = {
	setup: setup,
	stop: stop
};

if (require.main === module) {
	//TODO: Make this read from a file
	setup({
		database: {
			engine: 'sqlite3',
			filename: 'database.sqlite'
		}
	});
}
