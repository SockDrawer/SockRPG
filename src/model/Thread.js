'use strict';

/**
 * The Game table.
 *
 * *Note: This module is _not_ intended to be used directly; use the DAO module for all data access.*
 *
 * @module Game
 * @license MIT
 * @author yamikuronue
 */


class Thread {
	constructor (rowData) {
		this.data = rowData;
	}
	
	get ID() {
		return this.data.ID;
	}
	
	get Title() {
		return this.data.Title;
	}
	
	set Title(newTitle) {
		this.data.Title = newTitle;
	}
}

module.exports = Thread;