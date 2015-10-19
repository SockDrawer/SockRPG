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
 * @param {Object} config The necessary information to set up the database
 * @param {String} config.sqlite The location of the SQLite file to use; if it doesn't exist, create it
 * @param {Object} config.postgres The necessary information to connect to a PostgreSQL database
 * @param {String} config.postgres.host The host running the PostGreSQL server
 * @param {String} config.postgres.name The name of the database to connect to
 * @param {String} config.postgres.username The username of the user to connect as
 * @param {String} config.postgres.password The password of the user to connect as
 *
 * @returns {Promise} A Promise that is resolved when the database is initialised.
 */
function initialise(config) {
	const err = checkConfig(config);
	if (err) {
		return Promise.reject(err);
	}

	//Create the DB
	if (config.sqlite) {
		db = new Sequelize('SockRPG', null, null, {
			host: 'localhost',
			dialect: 'sqlite',
			logging: undefined,
			storage: config.sqlite
		});
	}
	if (config.postgres) {
		const settings = config.postgres;
		db = new Sequelize(settings.name, settings.username, settings.password, {
			host: settings.host,
			dialect: 'postgres',
			logging: undefined
		});
	}

	createModel();
	//It's alive!
	return db.sync();
}

/**
 * Validate the configuration. *For internal use only.*
 *
 * @param {Object} config The config object passed to `initialise()`
 *
 * @returns {Error} An error describing the issue with the config, or `null` if it is valid
 */
function checkConfig(config) {
	if (!config || !config.sqlite && !config.postgres) {
		return new Error('A database must be defined');
	}
	if (config.sqlite && config.postgres) {
		return new Error('Only one database can be defined at once');
	}
	if (config.sqlite) {
		return checkSQLite(config.sqlite);
	}
	return checkPostgres(config.postgres);
}

/**
 * Validate the SQLite configuration. *For internal use only.*
 *
 * @param {Object} config The `sqlite` member of the config object passed to `initialise()`
 *
 * @returns {Error} An error describing the issue with the config, or `null` if it is valid
 */
function checkSQLite(config) {
	if (typeof config !== 'string') {
		return new Error('SQLite location must be a string');
	}
}

/**
 * Validate the PostgreSQL configuration. *For internal use only.*
 *
 * @param {Object} config The `postgres` member of the config object passed to `initialise()`
 *
 * @returns {Error} An error describing the issue with the config, or `null` if it is valid
 */
function checkPostgres(config) {
	if (typeof config.name !== 'string' || typeof config.host !== 'string'
		|| typeof config.username !== 'string' || typeof config.password !== 'string') {
		return new Error('PostgreSQL settings must be strings');
	}
}

/**
 * Creates the database model. *For internal use only.*
 */
function createModel() {
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
}

/**
 * Closes the database. *Database must be reinitialised before it can be used again.*
 *
 * @returns {Promise} A Promise that is resolved when the database is closed.
 */
function close() {
	return new Promise((resolve) => {
		//Remove table exports
		module.exports.Users = undefined;
		module.exports.Boards = undefined;
		module.exports.Games = undefined;

		//Good night, good night! Parting is such sweet sorrow,
		//That I shall say good night till it be morrow.
		db.close();
		resolve();
	});
}
