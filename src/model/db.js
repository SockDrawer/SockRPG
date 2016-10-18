'use strict';

let knex = 'banana';


const db = {
	initialized: false,
	
	initialise: function initialise(config) {
		if (db.initialised) {
			return Promise.resolve();
		}
		
		knex = require('knex')({
			client: 'sqlite3',
			connection: {
				filename: ':memory:'
			},
		//	debug: true,
			useNullAsDefault: true
		});
		
		return knex.schema.createTableIfNotExists('Games', (table) => {
			table.increments('ID').primary();
			table.string('gameDescription');
		}).then(() => {
			return knex.schema.createTableIfNotExists('Users', (table) => {
				table.increments('ID').primary();
				table.string('Username').notNullable().unique();
			});
		}).then(() => {
			return knex.schema.createTableIfNotExists('Boards', (table) => {
				table.increments('ID').primary();
				table.integer('Owner').references('Users.ID');//.notNullable();  //This shouldn't be nullable, but we don't have users working yet
				table.integer('GameID').references('Games.ID').nullable();
				table.string('Name').notNullable();
				table.boolean('Adult').defaultTo(false);
				table.string('Description').notNullable().defaultTo('');
			});
		}).then(() => {
			return knex.schema.createTableIfNotExists('ChildBoards', (table) => {
				table.increments('ID').primary();
				table.integer('ParentID').references('Boards.ID').notNullable();
				table.integer('ChildID').references('Boards.ID').notNullable();
			});
		}).then(() => {
			return knex.schema.createTableIfNotExists('Threads', (table) => {
				table.increments('ID').primary();
				table.string('Title').notNullable();
				table.integer('Board').references('Boards.ID').notNullable();
			});
		}).then(() => {
			return knex.schema.createTableIfNotExists('Posts', (table) => {
				table.increments('ID').primary();
				table.integer('Thread').references('Threads.ID').notNullable();
				table.string('Body').notNullable();
			});
		}).then(() => {
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
		knex = null;
		db.initialised = false;
		
		return Promise.resolve();
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
