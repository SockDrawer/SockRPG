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

const controller = {
	getHomePage: getHomePage,
	getThreadView: getThreadView
};

module.exports = controller;
