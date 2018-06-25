'use strict';
/**
 * The controller for the thread API
 *
 *
 * @module threadController
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

const Thread = require('../model/Thread');
const Post = require('../model/Post');
const Board = require('../model/Board');

/**
* Get all threads in a board
* @param {Request} req Express' request object. Expects an ID under the params key
* @param {Response} res Express' response object.
* @returns {Promise} A Promise that is resolved with a list of threads
*/
function getThreadsForBoard(req, res) {
	
	return Board.getBoard(req.params.id).then((data) => {
		if (Array.isArray(data)) {
			data = data[0]; //Only the first board
		}
		if (!data) {
			res.status(404).end();
			return Promise.resolve();
		}

		return Thread.getThreadsInBoard(data.ID).then((threads) => {
			res.status(200).send(threads.map((thread) => thread.serialize()));
		});
	});
}

/**
* Get a single thread
* @param {Request} req Express' request object. Expects an ID under the params key
* @param {Response} res Express' response object.
* @returns {Promise} A Promise that is resolved with the details of a thread
*/
function getThread(req, res) {
	let thread;
	
	return Thread.getThread(req.params.id).then((data) => {
		if (!data) {
			res.status(404).end();
			return Promise.resolve();
		}
		
		thread = data.serialize();
		
		return Post.getPostsInThread(thread.ID).then((posts) => {
			if (posts) {
				thread.posts = posts.map((post) => post.serialize());
			} else {
				thread.posts = [];
			}
			
			res.status(200).send(thread);
			return Promise.resolve();
		});
	});
}

/**
* Add a thread to the board
* @param {Request} req Express' request object. Expects an ID under the params key
* @param {Response} res Express' response object.
* @returns {Promise} A Promise that is resolved when the thread is added
*/
function addThreadToBoard(req, res) {
	return Board.getBoard(req.params.id).then((data) => {
		if (!data) {
			res.status(404).end();
			return Promise.resolve();
		}

		const newThread = req.body || {};
		newThread.Board = req.params.id;
		
		return Thread.addThread(newThread).then((ids) => {
			const ret = {
				id: ids[0]
			};

			res.status(200).send(ret);
			return Promise.resolve();
		});
	});
}

const controller = {
	getThreadsForBoard: getThreadsForBoard,
	getThread: getThread,
	addThreadToBoard: addThreadToBoard
};

module.exports = controller;
