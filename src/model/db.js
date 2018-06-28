'use strict';

let knex = 'banana';

const ensureKnexTables = (knexdb, tables) => {
	const fn = () => {
		if (!tables.length) {
			return null;
		}
		const [name, creator] = tables.shift();
		return knexdb.schema.hasTable(name)
			.then((exists) => {
				if (exists) {
					return null;
				}
				return knexdb.schema.createTable(name, creator);
			})
			.then(fn);
	};
	return fn();
};

const db = {
	initialized: false,

	initialise: function initialise(config) {
		if (db.initialised) {
			return Promise.resolve();
		}

		knex = require('knex')({
			client: 'sqlite3',
			connection: {
				filename: config.database.filename
			},
			useNullAsDefault: true
		});

		const tables = [
			['Games', (table) => {
				table.increments('ID').primary();
				table.string('gameDescription');
			}],
			['Users', (table) => {
				table.increments('ID').primary();
				table.string('Username').notNullable().unique();
			}],
			['Boards', (table) => {
				table.increments('ID').primary();
				//This shouldn't be nullable, but we don't have users working yet
				table.integer('Owner').references('Users.ID'); //.notNullable();
				table.integer('GameID').references('Games.ID').nullable();
				table.string('Name').notNullable();
				table.boolean('Adult').defaultTo(false);
				table.string('Description').notNullable().defaultTo('');
			}],
			['ChildBoards', (table) => {
				table.increments('ID').primary();
				table.integer('ParentID').references('Boards.ID').notNullable();
				table.integer('ChildID').references('Boards.ID').notNullable();
			}],
			['Threads', (table) => {
				table.increments('ID').primary();
				table.string('Title').notNullable();
				table.integer('Board').references('Boards.ID').notNullable();
			}],
			['Posts', (table) => {
				table.increments('ID').primary();
				table.integer('Thread').references('Threads.ID').notNullable();
				table.string('Body').notNullable();
			}]
		];

		return ensureKnexTables(knex, tables)
			.then(() => {
				db.initialised = true;
				return Promise.resolve(db.initialised);
			});
	},

	/**
	 * Tears down the DAO. *The DAO must be reinitialised before it can be used again.*
	 *
	 * @returns {Promise} A Promise that is resolved when the DAO is torn down.
	 */
	teardown: function teardown() {
		let destroyer = Promise.resolve();
		if (knex) {
			destroyer = destroyer.then(() => knex.destroy());
		}

		return destroyer.then(() => {
			knex = null;
			db.initialised = false;
		});
	},

	/**
	 * Reports if the DAO is initialised.
	 *
	 * @returns {boolean} Flag indicating whether the DAO is initialised.
	 */
	isInitialised: function isInitialised() {
		return db.initialised;
	}
};

module.exports = db;

//Support for db.knex:
Object.defineProperty(module.exports, 'knex', {
	get: function get() {
		return knex;
	},
	set: function set(kn) {
		knex = kn;
	}
});
