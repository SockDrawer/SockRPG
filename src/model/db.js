'use strict';

const merge = require('lodash.merge');
let knex = null;

const db = {
	initialized: false,

	initialise: async function initialise(config) {
		if (db.initialised) {
			return Promise.resolve();
		}
		
		const environment = process.env.DB_ENVIRONMENT || 'development';
		let connection = require('../../knexfile.js')[environment];
		if (config && config.database) {
			connection = merge(connection, config.database);
		}
		knex = require('knex')(connection);
		await knex.migrate.latest();
		db.initialised = true;
		return db.initialised;
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
