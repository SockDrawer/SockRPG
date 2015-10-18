'use strict';

/**
 * Database access and management.
 *
 * *Note: This module is _not_ intended to be used directly; use the DAO module for all data access.*
 *
 * @module db
 * @license MIT
 * @author RaceProUK
 */

const Sequelize = require('sequelize');

const specs = {
	/**
	 * Simple primary key specification.
	 */
	pk: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	/**
	 * Non-nullable foreign key specification.
	 */
	fkNonNullable: {
		foreignKey: {
			allowNull: false
		}
	},
	/**
	 * Nullable foreign key specification.
	 */
	fkNullable: {
		foreignKey: {
			allowNull: true
		}
	}
};

let db;

module.exports = {
	initialise: initialise,
	close: close
};

/**
 * Initialise the database. *Must be called before any other function.*
 *
 * @returns {Promise} A Promise that is resolved when the database is initialised.
 */
function initialise() {
	//Create the DB
	db = new Sequelize('SockRPG', null, null, {
		host: 'localhost',
		dialect: 'sqlite',
		storage: ':memory:',
		logging: undefined
	});

	//Define the tables
	const User = require('./User')(db, specs);
	const Board = require('./Board')(db, specs);
	const Game = require('./Game')(db, specs);

	//Set up the 1:1 relationships
	Board.belongsTo(Game, specs.fkNullable);

	//Set up the 1:N relationships
	User.hasMany(Board, specs.fkNonNullable);
	Board.hasMany(Board, specs.fkNullable);

	//Set up the M:N relationships
	User.belongsToMany(Game, {through: 'Gamemaster'});
	Game.belongsToMany(User, {through: 'Gamemaster'});

	//Set table exports
	module.exports.Users = User;
	module.exports.Boards = Board;
	module.exports.Games = Game;

	//It's alive!
	return db.sync();
}

/**
 * Closes the database. *Database must be reinitialised before it can be used again.*
 *
 * @returns {Promise} A Promise that is resolved when the database is closed.
 */
function close() {
	//Remove table exports
	module.exports.Users = undefined;
	module.exports.Boards = undefined;
	module.exports.Games = undefined;

	//Good night, good night! Parting is such sweet sorrow,
	//That I shall say good night till it be morrow.
	return new Promise((resolve) => {
		db.close();
		resolve();
	});
}
