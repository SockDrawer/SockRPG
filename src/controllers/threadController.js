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
const Board = require('../model/Board');

function getThreadsForBoard(req, res) {
	
	return Board.getBoard(req.params.id).then((data) => {
		if (Array.isArray(data)) {
			data = data[0]; //Only the first board
		}
		if (!data) {
			res.status(404).end();
			return;
		}

		return Thread.getThreadsInBoard(data.id).then((threads) => {
			res.status(200).send(JSON.stringify(threads.map((thread) => thread.serialize())));
		});
	});
}

function getThread(req, res) {
	
}

const controller = {
	getThreadsForBoard: getThreadsForBoard,
	getThread: getThread
};

module.exports = controller;
