'use strict';

const dao = require('./dao.js'); //This can be renamed later

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
			res.status(500).send({error: `Database error: ${err}`});
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
			res.status(500).send({error: `Database error: ${err}`});
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
			res.status(500).send({error: `Database error: ${err}`});
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
			res.status(500).send({error: `Database error: ${err}`});
		});
	}
};

module.exports = controller;
