'use strict';

const DB = require('./db');
let Game = null;
let Board = null;

const init = Promise.resolve()
	.then(() => {
		// This works around the incompletely constructed Game/Board objects issue
		Game = require('./Game');
		Board = require('./Board');
	});

const deserializeBoardOrGame = (data) => {
	if (data.GameID) {
		return new Game(data);
	}
	delete data.gameDescription;
	return new Board(data);
};

module.exports = {
	getBoardOrGame: (id) => init.then(() => {
		return DB.knex('Boards')
			.leftJoin('Games', 'Boards.GameID', 'Games.ID')
			.where('Boards.ID', id)
			.select('Boards.ID', 'ParentID', 'Owner', 'Name', 'Adult', 'GameID', 'gameDescription', 'Description')
			.then((rows) => {
				if (!rows.length) {
					return null;
				}
				return deserializeBoardOrGame(rows[0]);
			});
	}),
	getBoardsAndGames: (parentId) => init.then(() => {
		if (!parentId) {
			parentId = null;
		}
		return DB.knex('Boards')
			.leftJoin('Games', 'Boards.GameID', 'Games.ID')
			.where('Boards.ParentID', parentId)
			.select('Boards.ID', 'ParentID', 'Owner', 'Name', 'Adult', 'GameID', 'gameDescription', 'Description')
			.then((rows) => rows.map(deserializeBoardOrGame));
	})
};
