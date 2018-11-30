'use strict';

/**
 * The controller for the pages
 *
 *
 * @module pageController
 * @license MIT
 * @author yamikuronue
 */

/*Express typedefs*/

/**
  @typedef Request
  @type {object}
  @property {object} params - The parameters for the request
 /

/**
  @typedef Response
  @type {object}
  @function send - The function to send data to the client
  @function status - Set the status code for the response
*/

const Board = require('../model/Board');
const Game = require('../model/Game');
const Thread = require('../model/Thread');
const Post = require('../model/Post');
const User = require('../model/User');
const SessionController = require('./sessionController');
const db = require('../model/db');
const passport = require('passport');
const {check, validationResult} = require('express-validator/check');

const debug = require('debug')('SockRPG:controller:Page');

/**
 * Get the home page to hand to the view
 * @param  {Request} req The Express request object
 * @param  {Response} res The Express response object
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function getHomePage(req, res) {
	const data = {csrfToken: req.csrfToken()};
	
	return Board.getAllBoards().then((boards) => {
		data.boards = boards ? boards.map((board) => board.serialize()) : boards;
		return Game.getAllGames();
	})
	.then((games) => {
		data.games = games ? games.map((game) => game.serialize()) : games;
	})
	.then(() => {
		if (req.isAuthenticated()) {
			data.user = req.user;
			data.loggedIn = true;
		} else {
			data.loggedIn = false;
		}
		res.render('home', data);
	})
	.catch((err) => {
		debug(`Error Getting Page: ${err.toString()}`);
		//TODO: Add Proper Logging
		res.status(500).send({error: err.toString()});
	});
}

/**
 * Get the login page to hand to the view
 * @param  {Request} req The Express request object
 * @param  {Response} res The Express response object
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function getLoginView(req, res) {
	const data = {csrfToken: req.csrfToken()};

	return Promise.resolve().then(() => {
		res.render('login', data);
	})
	.catch((err) => {
		//TODO: logging errors
		debug(`Error Getting Login View: ${err.toString()}`);
		res.status(500).send({error: err.toString()});
	});
}

/**
 * Get the page for a board with threads in it
 * @param  {Request} req The Express request object
 * @param  {Response} res The Express response object
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
async function getBoardView(req, res) {
	let board;

	try {
		const boardData = await Board.get(req.params.id);
		if (!boardData) {
			res.status(404);
			res.end();
			return;
		}

		board = boardData.serialize();

		const threads = await Thread.getThreadsInBoard(req.params.id);
		board.threads = [];
		
		const numThreads = threads.length;
		for (let i = 0; i < numThreads; i++) {
			const stats = await threads[i].getThreadStatistics();
			board.threads[i] = threads[i].serialize();
			board.threads[i].Stats = stats;
		}
		board.csrfToken = req.csrfToken();
		res.render('board', board);
	} catch (err) {
		debug(`Error Getting Board View: ${err.toString()}`);
		//TODO: Add Proper Logging
		res.status(500);
		res.send({error: err.toString()});
	}
}

/**
 * Get the page for a thread with posts on it
 * @param  {Request} req The Express request object
 * @param  {Response} res The Express response object
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function getThreadView(req, res) {
	let retval;
	return Thread.getThread(req.params.id).then((data) => {
		if (!data) {
			res.status(404);
			res.end();
			return Promise.resolve();
		}

		retval = data.serialize();
		return Post.getPostsInThread(req.params.id).then((posts) => {
			retval.posts = posts ? posts.map((post) => post.serialize()) : [];
			retval.csrfToken = req.csrfToken();

			res.render('thread', retval);
		});
	})
	.catch((err) => {
		debug(`Error Getting Thread View: ${err.toString()}`);
		//TODO: Add Proper Logging
		res.status(500);
		res.send({error: err.toString()});
	});
}

/**
 * Get the signup page to hand to the view
 * @param  {Request} req The Express request object
 * @param  {Response} res The Express response object
 * @returns {Promise} A promise that will resolve when the response has been sent.
  */
function getSignupView(req, res) {
	const data = {csrfToken: req.csrfToken()};

	return Promise.resolve().then(() => {
		res.render('signup', data);
	})
	.catch((err) => {
		//TODO: logging errors
		debug(`Error Getting Signup View: ${err.toString()}`);
		res.status(500).send({error: err.toString()});
	});
}

/**
 * Handle signup page post
 * @param  {Request} req The Express request object
 * @param  {Response} res The Express response object
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
const postSignup = [
	check('username').isLength({min: 1}).withMessage('Username must be specified.'),
	check('password').isLength({min: 8}).withMessage('Password must be at least 8 characters.'),
	check('passwordconfirm').custom((value, {req, _, __}) => {
		if (value !== req.body.password) {
			throw new Error();
		}
		return value;
	}).withMessage('Passwords do not match.'),
	
	(req, res) => {
		const errors = validationResult(req);
		
		// Render the page again with validation errors if any
		if (!errors.isEmpty()) {
			res.render('signup', {csrfToken: req.csrfToken(), data: req.body, errors: errors.array()});
			return null;
		}
		
		const user = {Username: req.body.username, Admin: false, Password: req.body.password};
		
		return User.addUser(user)
		.then((ids) => User.getUser(ids[0])) //get it back out so we have the ID
		.then((dbuser) => {
			return req.login(dbuser, (err) => {
				if (err) {
					throw err;
				}
				res.redirect('/');
			});
		})
		.catch((err) => {
			// TODO: Obviously need to handle failures here with proper user friendly errors
			res.status(500);
			res.send({error: err.toString()});
		});
	}
];

/**
 * Get the edit profile page to hand to the view
 * @param  {Request} req The Express request object
 * @param  {Response} res The Express response object
 * @returns {Promise} A promise that will resolve when the response has been sent.
  */
function getProfileEdit(req, res) {

	if (!req.user) {
		return res.redirect('/login');
	}
	const data = req.user.serialize();
	data.csrfToken = req.csrfToken();
	res.render('profileEdit', data);
	return Promise.resolve();
}

const controller = {
	getHomePage: getHomePage,
	getThreadView: getThreadView,
	getBoardView: getBoardView,
	getLoginView: getLoginView,
	getSignupView: getSignupView,
	postSignup: postSignup,
	getProfileEdit: getProfileEdit
};

module.exports = controller;
