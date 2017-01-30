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
				filename: config.database.filename
			},
			useNullAsDefault: true
		});
		
		return knex.schema.hasTable('Games').then((exists) => {
			if (!exists) {
				return knex.schema.createTable('Games', (table) => {
					table.increments('ID').primary();
					table.string('gameDescription');
					table.integer('gameMaster').references('Users.ID');
				});
			}
		})
		.then(() => knex.schema.hasTable('Users'))
		.then((exists) => {
			if (!exists) {
				return knex.schema.createTable('Users', (table) => {
					table.increments('ID').primary();
					table.string('Username').notNullable().unique();
				});
			}
		})
		.then(() => knex.schema.hasTable('Boards'))
		.then((exists) => {
			if (!exists) {
				return knex.schema.createTableIfNotExists('Boards', (table) => {
					table.increments('ID').primary();
					table.integer('Owner').references('Users.ID');//.notNullable();  //This shouldn't be nullable, but we don't have users working yet
					table.integer('GameID').references('Games.ID').nullable();
					table.string('Name').notNullable();
					table.boolean('Adult').defaultTo(false);
					table.string('Description').notNullable().defaultTo('');
				});
			}
		})
		.then(() => knex.schema.hasTable('Boards'))
		.then((exists) => {
			if (!exists) {
				return knex.schema.createTableIfNotExists('ChildBoards', (table) => {
					table.increments('ID').primary();
					table.integer('ParentID').references('Boards.ID').notNullable();
					table.integer('ChildID').references('Boards.ID').notNullable();
				});
			}
		})
		.then(() => knex.schema.hasTable('Threads'))
		.then((exists) => {
			if (!exists) {
				return knex.schema.createTableIfNotExists('Threads', (table) => {
					table.increments('ID').primary();
					table.string('Title').notNullable();
					table.integer('Board').references('Boards.ID').notNullable();
				});
			}
		})
		.then(() => knex.schema.hasTable('Posts'))
		.then((exists) => {
			if (!exists) {
				return knex.schema.createTableIfNotExists('Posts', (table) => {
					table.increments('ID').primary();
					table.integer('Thread').references('Threads.ID').notNullable();
					table.string('Body').notNullable();
					table.timestamp('post_time').defaultTo(knex.fn.now());
				});
			}
		})
		.then(() => knex.schema.hasTable('Tags'))
		.then((exists) => {
			if (!exists) {
				return knex.schema.createTableIfNotExists('Tags', (table) => {
					table.integer('GameID').references('Games.ID').notNullable();
					table.string('Tag').notNullable();
					table.primary(['GameID', 'Tag']);
				});
			}
		})
		.then(() => knex.schema.hasTable('Text'))
		.then((exists) => {
			if (!exists) {
				return knex.schema.createTableIfNotExists('Text', (table) => {
					table.string('slotName').primary();
					table.text('data');
				}).then(() => {
					//Insert the default text
					return knex('Text').insert({
						slotName: 'home_overview',
						data: '<h1>Welcome to SiteName!</h1>\n<p>Welcome to the site! This text is customizable if you are the admin. It should talk about why someone should join your roleplaying site.</p>'
					});
				});
			}
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
