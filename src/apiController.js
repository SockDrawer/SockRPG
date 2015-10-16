'use strict';

const dao = require('./dao.js'); //This can be renamed later

const controller = {
	getAllGames: (res) => {
		//For this sprint, all users can see all games
		dao.getAllGames().then((data) => {
			for (let i = 0; i < data.length; i++) {
				data[i].canonical = `/api/game/${data[i].id}`;
			}
			res.send(data);
		}).catch((err) => {
			//TODO: logging errors
			res.status(500).send({error: `Database error: ${err}`});
		});
	}
};

module.exports = controller;
