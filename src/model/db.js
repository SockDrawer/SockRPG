'use strict';

let knex = 'banana';

const ensureKnexTables = async(knexdb, tables) => {
	for (let i = 0; i < tables.length; i++) {
		const [name, creator] = tables[i];

		const exists = await knexdb.schema.hasTable(name);
		if (!exists) {
			await knexdb.schema.createTable(name, creator);
		}
	}
};

const db = {
	initialized: false,

	initialise: async function initialise(config) {
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
				table.boolean('Admin').notNullable().defaultTo(false);
				table.string('AuthSecret').notNullable();
			}],
			['Boards', (table) => {
				table.increments('ID').primary();
				//This shouldn't be nullable, but we don't have users working yet
				table.integer('Owner').references('Users.ID'); //.notNullable();
				table.integer('ParentID').references('Boards.ID').nullable();
				table.integer('GameID').references('Games.ID').nullable();
				table.string('Name').notNullable();
				table.boolean('Adult').defaultTo(false);
				table.string('Description').notNullable().defaultTo('');
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
				table.integer('Poster').references('Users.ID');
				table.timestamps(false, true);
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
