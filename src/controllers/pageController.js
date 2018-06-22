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
const db = require('../model/db');
const {check, validationResult} = require('express-validator/check');

/**
 * Get the home page to hand to the view
 * @param  {Request} req The Express request object
 * @param  {Response} res The Express response object
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function getHomePage(req, res) {
	const data = {};
	
	if (db.firstRun) {
		// TODO: implement something here? Does this even belong here? Not sure getHomePage is the best place
		//       for firstRun handling.
	}

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
		//TODO: logging errors
		console.log(err);
		res.status(500).send({error: err.toString()});
	});
}

/**
 * Get the login page to hand to the view
 * @param  {Request} req The Express request object
 * @param  {Response} res The Express response object
 */
function getLoginView(req, res) {
	const data = { csrfToken: req.csrfToken() };

	res.render('login', data);
}

/**
 * Get the page for a board with threads in it
 * @param  {Request} req The Express request object
 * @param  {Response} res The Express response object
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function getBoardView(req, res) {
	let board;
	return Board.getBoard(req.params.id).then((data) => {
		if (!data) {
			res.status(404);
			res.end();
			return Promise.resolve();
		}
		
		board = data.serialize();
		return Thread.getThreadsInBoard(req.params.id).then((threads) => {
			board.threads = threads ? threads.map((thread) => thread.serialize()) : [];
			
			res.render('board', board);
		});
	})
	.catch((err) => {
		res.status(500);
		res.send({error: err.toString()});
	});
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
	
			res.render('thread', retval);
		});
	})
	.catch((err) => {
		res.status(500);
		res.send({error: err.toString()});
	});
}

/**
 * Get the signup page to hand to the view
 * @param  {Request} req The Express request object
 * @param  {Response} res The Express response object
  */
function getSignupView(req, res) {
	const data = { csrfToken: req.csrfToken() };

	res.render('signup', data);
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
	check('passwordconfirm').custom((value, {req, loc, path}) => {
		if (value !== req.body.password) {
			throw new Error();
		}
		return value;
	}).withMessage('Passwords do not match.'),
	
	(req, res, next) => {
		const errors = validationResult(req);
		
		// Render the page again with validation errors if any
		if (!errors.isEmpty()) {
			res.render('signup', {csrfToken: req.csrfToken(), data: req.body, errors: errors.array()});
			return null;
		}
		
		const user = {Username: req.body.username, Admin: false, Password: req.body.password};
		
		return User.addUser(user)
		.then(() => {
			// TODO: Tell the user about success, or just log them in?
			res.redirect('/');
		})
		.catch((err) => {
			// TODO: Obviously need to handle failures here with proper user friendly errors
			res.status(500);
			res.send({error: err.toString()});
		});
	}
];

const controller = {
	getHomePage: getHomePage,
	getThreadView: getThreadView,
	getBoardView: getBoardView,
	getLoginView: getLoginView,
	getSignupView: getSignupView,
	postSignup: postSignup
};

module.exports = controller;
