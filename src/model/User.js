'use strict';

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
}

module.exports = User;
