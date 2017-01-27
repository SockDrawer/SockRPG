'use strict';
const DB = require('./db');

/**
 * The Game table.
 *
 * *Note: This module is _not_ intended to be used directly; use the DAO module for all data access.*
 *
 * @module Game
 * @license MIT
 * @author yamikuronue
 */


class Text {
	constructor (rowData) {
		this.data = {};
		this.data.slotName = rowData.slotName;
		this.data.data = rowData.data;
		this.Canonical = `/api/text/${this.name}`;
	}
	
	get name() {
		return this.data.slotName;
	}
	
	get text() {
		return this.data.data;
	}
	
	set text(newText) {
		this.data.data = newText;
	}
	
	serialize() {
		const serial = JSON.parse(JSON.stringify(this.data));
		serial.Canonical = this.Canonical;
		return serial;
	}
	
	save() {
		return DB.knex('Text').where('slotName', this.name).update(this.data);
	}
	
	static getTextForSlot(name) {
		return DB.knex('Text')
		.where('Text.slotName', name).select('slotName', 'data')
		.then((rows) => {
			if (!rows || rows.length <= 0) {
				return null;
			}
	
			return new Text(rows[0]);
		});
	}
}

module.exports = Text;
