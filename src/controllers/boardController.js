'use strict';
/**
 * The controller for the board API
 *
 *
 * @module boardController
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

/**
 * Get all games in the esystem
 * @param {Request} _ Express' request object. Expects an ID under the params key
 * @param {Response} res Express response object
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function getAllGames(_, res) {
	//For this sprint, all users can see all games
	return Game.getAllGames().then((data) => {
		res.send(data);
	}).catch((err) => {
		//TODO: logging errors
		res.status(500).send({error: err.toString()});
	});
}

/**
 * Get a single game.
 * @param {Request} req Express' request object. Expects an ID under the params key
 * @param {Response} res Express' response object.
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function getGame(req, res) {
	if (!req.params.id) {
		res.status(501).send({error: 'Missing ID'});
		return Promise.resolve();
	}

	return Game.getGame(req.params.id).then((data) => {
		if (Array.isArray(data)) {
			data = data[0]; //Only the first game
		}

		if (!data) {
			res.status(404).end();
			return;
		}
		
		const output = data.serialize();
		
		data.getThreads().then((threadIDs) => {
			output.threadList = threadIDs;
			res.send(output);
		});
	}).catch((err) => {
		//TODO: logging errors
		console.log(err);
		res.status(500).send({error: err.toString()});
	});
}

/**
 * Add a game to the collection.
 * @param {Request} req Express' request object. Expects a body with a name parameter
 * @param {Response} res Express' response object.
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function addGame(req, res) {
	return Game.addGame(req.body).then((index) => {
		res.status(200).send({id: index[0]}).end();
	}).catch((err) => {
		//TODO: logging errors
		console.log(err);
		res.status(500).send({error: err.toString()});
	});
}

/**
 * Update a game
 * @param {Request} req Express' request object. Expects a body with data and an ID under the params key
 * @param {Response} res Express' response object.
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function updateGame(req, res) {
	return Game.getGame(req.params.id).then((board) => {
		board.Name = req.body.Name || board.Name;
		board.Owner = req.body.Owner || board.Owner;
		board.description = req.body.Game.gameDescription || board.description;
		
		if ('Adult' in req.body) {
			board.Adult = req.body.Adult;
		}
		return board.save();
	}).then(() => {
		res.status(200).end();
	}).catch((err) => {
		//TODO: logging errors
		console.log(err);
		if (err.toString().indexOf('No such') > -1) {
			res.status(404).send({error: err.toString()});
		} else {
			res.status(500).send({error: err.toString()});
		}
	});
}

/**
 * Get all boards in the system
 * @param {Request} _ Express' request object. Expects an ID under the params key
 * @param {Response} res Express' response object.
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function getAllBoards(_, res) {
	//For this sprint, all users can see all games
	return Board.getAllBoards().then((data) => {
		for (let i = 0; i < data.length; i++) {
			data[i].Canonical = `/api/boards/${data[i].ID}`;
		}
		res.send(data);
	}).catch((err) => {
		//TODO: logging errors
		console.log(err);
		res.status(500).send({error: err.toString()});
	});
}

/**
 * Get a single board.
 * @param {Request} req Express' request object. Expects an ID under the params key
 * @param {Response} res Express' response object.
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function getBoard(req, res) {
	if (!req.params.id) {
		res.status(501).send({error: 'Missing ID'});
		return Promise.resolve();
	}

	return Board.getBoard(req.params.id).then((data) => {
		if (Array.isArray(data)) {
			data = data[0]; //Only the first board
		}
		if (!data) {
			res.status(404).end();
			return;
		}

		const output = data.serialize();
		
		data.getThreads().then((threadIDs) => {
			output.threadList = threadIDs;
			res.send(output);
		});
	}).catch((err) => {
		//TODO: logging errors
		console.log(err);
		res.status(500).send({error: err.toString()});
	});
}

/**
 * Update a board
 * @param {Request} req Express' request object. Expects a body with a name parameter
 * @param {Response} res Express' response object.
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function addBoard(req, res) {
	return Board.addBoard(req.body).then((index) => {
		res.status(200).send({
			id: index[0]
		}).end();
	}).catch((err) => {
		//TODO: logging errors
		console.log(err);
		res.status(500).send({error: err.toString()});
	});
}

/**
 * Add a board to the collection.
 * @param {Request} req Express' request object. Expects a body with data and an ID under the params key
 * @param {Response} res Express' response object.
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function updateBoard(req, res) {
	
	return Board.getBoard(req.params.id).then((board) => {
		board.Name = req.body.Name || board.Name;
		board.Owner = req.body.Owner || board.Owner;
		if ('Adult' in req.body) {
			board.Adult = req.body.Adult;
		}
		return board.save();
	}).then(() => {
		res.status(200).end();
	}).catch((err) => {
		//TODO: logging errors
		console.log(err);
		if (err.toString().indexOf('No such') > -1) {
			res.status(404).send({error: err.toString()});
		} else {
			res.status(500).send({error: err.toString()});
		}
	});
}

const controller = {
	getAllGames: getAllGames,

	getGame: getGame,

	addGame: addGame,

	updateGame: updateGame,

	getAllBoards: getAllBoards,

	getBoard: getBoard,

	addBoard: addBoard,

	updateBoard: updateBoard

};

module.exports = controller;
