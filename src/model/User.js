'use strict';

const DB = require('./db');

/**
 * The User table.
 *
 * *Note: This module is _not_ intended to be used directly; use the DAO module for all data access.*
 *
 * @module User
 * @license MIT
 * @author Yamikuronue
 */

class User {
	constructor(row) {
		this.ID = row.ID;
		this.Username = row.Username;
	}
	
	/**
	* Add a user.
	*
	* @param {Object} user The user to add
	*
	* @returns {Promise} A Promise that is resolved with the user added
	*/
	static addUser(user) {
		return DB.knex('Users').insert(user);
	}

}

module.exports = User;
