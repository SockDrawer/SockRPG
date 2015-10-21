'use strict';
/**
 * The controller for the API
 *
 *
 * @module apiController
 * @license MIT
 * @author yamikuronue
 */
 
const dao = require('./dao.js');

const controller = {
	getAllGames: (res) => {
		//For this sprint, all users can see all games
		return dao.getAllGames().then((data) => {
			for (let i = 0; i < data.length; i++) {
				data[i].canonical = `/api/game/${data[i].id}`;
			}
			res.send(data);
		}).catch((err) => {
			//TODO: logging errors
			res.status(500).send({error: err.toString()});
		});
	},

	getGame: (req, res) => {
		if (!req.params.id) {
			res.status(501).send({error: 'Missing ID'});
			return Promise.resolve();
		}

		return dao.getGame(req.params.id).then((data) => {
			if (Array.isArray(data)) {
				data = data[0]; //Only the first game
			}

			if (!data) {
				res.status(404);
				return;
			}
			data.canonical = `/api/game/${data.id}`;

			res.send(data);
		}).catch((err) => {
			//TODO: logging errors
			res.status(500).send({error: err.toString()});
		});
	},

	getAllBoards: (res) => {
		//For this sprint, all users can see all games
		return dao.getAllBoards().then((data) => {
			for (let i = 0; i < data.length; i++) {
				data[i].canonical = `/api/board/${data[i].id}`;
			}
			res.send(data);
		}).catch((err) => {
			//TODO: logging errors
			res.status(500).send({error: err.toString()});
		});
	},

	getBoard: (req, res) => {
		if (!req.params.id) {
			res.status(501).send({error: 'Missing ID'});
			return Promise.resolve();
		}

		return dao.getBoard(req.params.id).then((data) => {
			if (Array.isArray(data)) {
				data = data[0]; //Only the first board
			}

			if (!data) {
				res.status(404);
				return;
			}
			data.canonical = `/api/board/${data.id}`;

			res.send(data);
		}).catch((err) => {
			//TODO: logging errors
			res.status(500).send({error: err.toString()});
		});
	},
	
	getAllUsers: (res) => {
		return dao.getAllUsers().then((data) => {
			for (let i = 0; i < data.length; i++) {
				data[i].canonical = `/api/user/${data[i].id}`;
			}
			res.send(data);
		}).catch((err) => {
			//TODO: logging errors
			res.status(500).send({error: err.toString()});
		});
	},
	
	getUser: (req, res) => {
		
		const handleData = (data) => {
			if (Array.isArray(data)) {
				data = data[0]; //Only the first game
			}

			if (!data) {
				res.status(404);
				return;
			}
			data.canonical = `/api/user/${data.id}`;

			res.send(data);
		};
			
		const handleError = (err) => {
			//TODO: logging errors
			res.status(500).send({error: err.toString()});
		};
						
		//Check if the ID is a number
		if (Number.parseInt(req.params.id, 10) == req.params.id) { //eslint-disable-line eqeqeq
			return dao.getUser(req.params.id).then(handleData).catch(handleError);
		
		//Otherwise it's a name
		} else if (req.params.id) {
			return dao.getUserByName(req.params.id).then(handleData).catch(handleError);
		}
	
		//Fallthrough if we did neither:
		res.status(501).send({error: 'Missing ID'});
		return Promise.resolve();
	}
};

module.exports = controller;
