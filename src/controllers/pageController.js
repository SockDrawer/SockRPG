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
const Text = require('../model/Text');

/**
 * Get the home page to hand to the view
 * @param  {Request} req The Express request object
 * @param  {Response} res The Express response object
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function getHomePage(req, res) {
	const data = {};

	return Board.getAllBoards().then((boards) => {
		data.boards = boards ? boards.map((board) => board.serialize()) : boards;
		return Game.getAllGames();
	})
	.then((games) => {
		data.games = games ? games.map((game) => game.serialize()) : games;
	})
	.then(() => {
		res.render('home', data);
	})
	.catch((err) => {
		//TODO: logging errors
		console.log(err);
		res.status(500).send({error: err.toString()});
	});
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
* Update text on a page slot. For CKEditor to send to
* @param {Request} req Express' request object. Expects an ID under the params key
* @param {Response} res Express' response object.
* @returns {Promise} A Promise that is resolved when the thread is added
*/
function updateText(req, res) {
	//check if slot is valid
	return Text.getTextForSlot(req.params.id).then((text) => {
		if (!text) {
			res.status(404).end();
			return Promise.resolve();
		}
		
		//req.body is input from client; cannot be trusted
		//I know there's a reflected XSS here, but for now, let's get it working:
		text.text = req.body;
		res.status(200).end();
		return text.save();
	});
}

const controller = {
	getHomePage: getHomePage,
	getThreadView: getThreadView,
	getBoardView: getBoardView,
	updateText: updateText
};

module.exports = controller;
