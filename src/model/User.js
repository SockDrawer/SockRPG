'use strict';

const DB = require('./db');
const bcrypt = require('bcrypt');

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
		this.data.Admin = Boolean(row.Admin);
		this.data.AuthSecret = row.AuthSecret;
		this.data.DisplayName = row.DisplayName ? row.DisplayName : row.Username;
		this.data.Avatar = row.Avatar;
		
		//Canonical link
		this.Canonical = `/api/users/${this.data.ID}`;
	}
	
	get ID() {
		return this.data.ID;
	}
	
	get Username() {
		return this.data.Username;
	}
	
	get DisplayName() {
		return this.data.DisplayName;
	}
	
	set Username(us) {
		this.data.Username = us;
	}
	
	get Admin() {
		return Boolean(this.data.Admin);
	}
	
	set Admin(a) {
		this.data.Admin = a;
	}
	
	get AuthSecret() {
		return this.data.AuthSecret;
	}
	
	set AuthSecret(a) {
		this.data.AuthSecret = a;
	}
	
	serialize() {
		const serial = JSON.parse(JSON.stringify(this.data));
		serial.Canonical = this.Canonical;
		delete serial.AuthSecret; // Users of serailization don't need this... it really really shouldn't leave the server
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
	* @returns {Promise} A Promise that is resolved with the user ID of the user added
	*/
	static addUser(user) {
		// TODO: decide number of rounds in a better way than just hardcoding this. Probably some config that's auto-defaulted at install time?
		const hashRounds = 10;
		
		// TODO: Various anti-abuse checks eventually should probably go here.
		
		if (user.Admin) {
			// TODO: Validate whether this is a situation where the created user can be an admin.
		}
		
		return bcrypt.hash(user.Password, hashRounds)
		.then((hash) => {
			// Create copy of the user object with an AuthSecret instead of Password.
			const newUser = {
				Username: user.Username,
				Admin: user.Admin,
				DisplayName: user.DisplayName,
				Avatar: user.Avatar,
				AuthSecret: `bcrypt:${hash}`
			};
			return Promise.resolve(DB.knex('Users').insert(newUser));
		});
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
		return DB.knex('Users').where('ID', id).select('ID', 'Username', 'DisplayName', 'Avatar', 'Admin', 'AuthSecret').then((rows) => {
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
		return DB.knex('Users').where('Username', name).select('ID', 'Username', 'Admin', 'AuthSecret').then((rows) => {
			if (!rows || rows.length <= 0) {
				return null;
			}
			
			return new User(rows[0]);
		});
	}
	
	/**
	* Authenticate a user by passwordpassword is correct
	*
	* @param {String} user The user being checked for authentication
	* @param {String} pass The password for the user
	*
	* @returns {Promise} A Promise that is resolved with true if the user is authenticated, false otherwise
	*/
	static authUserByPassword(user, pass) {
		const authSecret = user.AuthSecret.split(':');
		const authMethod = authSecret[0];
		const authHash = authSecret[1];
			
		if (authMethod === 'bcrypt') {
			return bcrypt.compare(pass, authHash);
		}
		
		// No valid auth method, return null.
		return Promise.resolve(false);
	}
	
	/**
	* Get a user by name, but only if the supplied password is correct
	*
	* @param {String} name The username of the user requested
	* @param {String} pass The password for the user
	*
	* @returns {Promise} A Promise that is resolved with the user or null
	*/
	static getAuthenticatedUserByNameAndPassword(name, pass) {
		// TODO: Anti-abuse rate limiting should perhaps eventually go here.
		
		return User.getUserByName(name).then((user) => {
			// If no user is found, return null.
			if (!user) {
				return null;
			}
			
			return Promise.resolve(User.authUserByPassword(user, pass).then((ret) => {
				if (ret) {
					// Success, return logged in user.
					return user;
				}
				
				// Wrong password, return null.
				return null;
			}));
		});
	}
}

module.exports = User;
