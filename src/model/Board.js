'use strict';

/**
 * The Board table.
 *
 * *Note: This module is _not_ intended to be used directly; use the DAO module for all data access.*
 *
 * @module User
 * @license MIT
 * @author yamikuronue
 */

class Board {
	constructor (rowData) {
		this.data = rowData;
		if (rowData.BoardID) {
			this.data.id = rowData.BoardID;
		}
		
		//Type coersion
		this.data.ID = Number(this.data.ID);
		this.data.Adult = Boolean(this.data.Adult);
	}
	
	get ID() {
		return this.data.ID;
	}
	
	get Owner() {
		return this.data.Owner;
	}
	
	get Name() {
		return this.data.Name;
	}
	
	set Name(newName) {
		this.data.Name = newName;
	}
	
	serialize() {
		return this.data;
	}
}

module.exports = Board;
