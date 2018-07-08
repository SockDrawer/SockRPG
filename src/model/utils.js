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
				const row = rows[0];
				if (row.GameID) {
					return new Game(row);
				}
				return new Board(row);
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
			.then((rows) => rows.map((row) => {
				if (row.GameID) {
					return new Game(row);
				}
				return new Board(row);
			}));
	})
};
