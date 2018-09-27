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

const bodyParser = require('body-parser');
const debug = require('debug')('server');
const promisify = require('util').promisify;
const cookieParser = require('cookie-parser');
const session = require('express-session');
const csurf = require('csurf');
const validator = require('express-validator');

//Model
const DB = require('./model/db');
const User = require('./model/User');

//Controllers
const cBoard = require('./controllers/boardController.js');
const cThread = require('./controllers/threadController.js');
const cPost = require('./controllers/postController.js');
const cPage = require('./controllers/pageController.js');
const cUser = require('./controllers/userController.js');
const cSession = require('./controllers/sessionController.js');

//Views
const hbs = exphbs.create({
	defaultLayout: 'main',
	layoutsDir: 'src/views/layouts',
	partialsDir: 'src/views/partials'
});

let println = debug;
let abort = () => {
	throw new Error('Initialization Error');
};

let app, server;

/**
 * Initialise the DAO
 * @param {Object} config The configuration object to use
 * @returns {Promise} A promise chain that resolves when the DAO is ready to use
 */
function setupDao(config) {
	debug('Initializing dao');
	//For now, static config
	return DB.initialise(config).then(() => {
		if (!DB.isInitialised()) {
			println('Initialization error');
			abort();
		}
	});
}

/* Passport*/

const passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
  
passport.serializeUser((user, done) => {
	done(null, user.ID);
});

passport.deserializeUser((user, done) => {
	User.getUser(user).then((u) => done(null, u));
});

passport.use(new LocalStrategy({
	usernameField: 'username',
	passwordField: 'password',
	passReqToCallback: true
},
(req, username, password, done) => {
	User.getAuthenticatedUserByNameAndPassword(username, password).then((user) => {
		if (!user) {
			return done(null, false, {message: 'Incorrect username or password.'});
		}

		// Successful authentication.
		return done(null, user);
	});
}
));

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

			//<Middleware
			app.use(bodyParser.urlencoded({extended: false}));
			app.use(validator());
			app.use(cookieParser());
			app.use(session({
				secret: 'keyboard cat',
				resave: false,
				saveUninitialized: false
			}));
			app.use(csurf({cookie: false}));
			app.use(passport.initialize());
			app.use(passport.session());
			

			//Static content and uploads
			app.use('/static', express.static('static'));
			app.use('/uploads', express.static('uploads'));

			/*Pages*/
			app.route('/')
				.get(cPage.getHomePage);
			app.route('/board/:id')
				.get(cPage.getBoardView);
			app.route('/thread/:id')
				.get(cPage.getThreadView);

			app.route('/login')
				.get(cPage.getLoginView)
				.post(passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login'})
				);

			app.route('/signup')
				.get(cPage.getSignupView)
				.post(cPage.postSignup);

			app.route('/logout')
				.get((req, res) => {
					req.logout();
					res.redirect('/');
				});

			const jsonParser = bodyParser.json({
				type: 'application/json'
			});
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

			app.route('/api/session')
				.get(cSession.getSession)
				.post(jsonParser, cSession.addSession)
				.patch(return405)
				.delete(cSession.deleteSession)
				.put(jsonParser, cSession.addSession);

			resolve();
		});
}

/**
 * Initialise the server
 * @param {Object} config The configuration object to use
 * @param {express} createApplicationFunc Function to create an express application.
 * @returns {Promise} A promise chain that resolves when the server is running
 */
function setup(config, createApplicationFunc) {
	app = createApplicationFunc();
	return setupDao(config).then(() => setupExpress()).then(() => {
		server = app.listen(config.http.port);
		println(`Server now listening on port ${config.http.port}`);
	});
}

/**
 * Stop the server
 * @returns {Promise} A promise chain that resolves when the server is running
 */
function stop() {
	const stopHttp = promisify(server.close.bind(server));
	return stopHttp()
		.then(() => DB.teardown())
		.then(() => println('Server stopped'));
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
	stop: stop,
	send405: return405
};

/* istanbul ignore if */
if (require.main === module) {
	// eslint-disable-next-line no-console
	println = (msg) => console.log(msg);

	abort = () => process.exit(1);

	//TODO: Make this read from a file
	setup({
		database: {
			engine: 'sqlite3',
			filename: './db/database.sqlite'
		},
		http: {
			// eslint-disable-next-line no-process-env
			port: process.env.PORT || 9000
		}
	}, express);
}
