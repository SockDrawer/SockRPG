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
		this.data = {};
		this.data.ID = row.ID;
		this.data.Username = row.Username;
		
		//Canonical link
		this.Canonical = `/api/users/${this.data.ID}`;
	}
	
	get ID() {
		return this.data.ID;
	}
	
	set ID(id) {
		this.data.ID = Number(id);
		this.data.Canonical = `/api/boards/${this.data.ID}`;
	}
	
	get Username() {
		return this.data.Username;
	}
	
	set Username(us) {
		this.data.Username = us;
	}
	
	serialize() {
		const serial = JSON.parse(JSON.stringify(this.data));
		serial.Canonical = this.Canonical;
		return serial;
	}
	
	save() {
		return DB.knex('Users').where('ID', this.ID).update(this.data);
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
	
	/**
	* Get all users in the forum.
	*
	* @returns {Promise} A Promise that is resolved with a list of vanilla boards
	*/
	static getAllUsers() {
		return DB.knex('Users').select().map((row) => new User(row));
	}
	

	/**
	* Get a user
	*
	* @param {Number} id The ID of the user requested
	*
	* @returns {Promise} A Promise that is resolved with the board requested
	*/
	static getUser(id) {
		return DB.knex('Users').where('ID', id).select('ID', 'Username').then((rows) => {
			if (!rows || rows.length <= 0) {
				return null;
			}
			
			return new User(rows[0]);
		});
	}
	
	/**
	* Get a user by name
	*
	* @param {String} name The username of the user requested
	*
	* @returns {Promise} A Promise that is resolved with the board requested
	*/
	static getUserByName(name) {
		return DB.knex('Users').where('Username', name).select('ID', 'Username').then((rows) => {
			if (!rows || rows.length <= 0) {
				return null;
			}
			
			return new User(rows[0]);
		});
	}
}

module.exports = User;
