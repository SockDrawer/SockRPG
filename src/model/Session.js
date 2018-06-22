'use strict';

/**
 * Model for representing a session.
 * Note: This is just an abstraction for REST API purposes, and the real
 *       session is managed by express-session.
 *
 * @module Session
 * @license MIT
 * @author Rednaxela
 */

class Session {
	constructor(sid, username, userID, csrfToken) {
		this.data = {};
		this.data.ID = sid;
		this.data.Username = username;
		this.data.UserID = userID;
		this.data.CsrfToken = csrfToken;
		
		//Canonical link
		this.Canonical = `/api/sessions/${this.data.ID}`;
	}
	
	get ID() {
		return this.data.ID;
	}
	
	get Username() {
		return this.data.Username;
	}
	
	get UserID() {
		return this.data.UserID;
	}
	
	get CsrfToken() {
		return this.data.CsrfToken;
	}
		
	serialize() {
		const serial = JSON.parse(JSON.stringify(this.data));
		serial.Canonical = this.Canonical;
		return serial;
	}
	
	/**
	* Get a session representation.
	*
	* @param {Object} req The express session
	*
	* @returns {Promise} A Promise that is resolved with the session
	*/
	static getSession(req) {
		const username = req.user ? req.user.Username : null;
		const userID = req.user ? req.user.ID : null;
	
		return Promise.resolve(new Session(req.sessionID, username, userID, req.csrfToken()));
	}
}

module.exports = Session;
