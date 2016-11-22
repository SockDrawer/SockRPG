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


class Thread {
	constructor (rowData) {
		this.data = {};
		this.data.ID = rowData.ID;
		this.data.Title = rowData.Title;
		this.Canonical = `/api/threads/${rowData.ID}`;
		this.boardName = rowData.Name;
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
	
	serialize() {
		const serial = JSON.parse(JSON.stringify(this.data));
		serial.Canonical = this.Canonical;
		return serial;
	}
	
	save() {
		return DB.knex('Threads').where('ID', this.ID).update(this.data);
	}
	
	
	static addThread(thread) {
		if (!thread instanceof Thread) {
			thread = new Thread(thread);
		}
		
		return new Promise((resolve, reject) => {
			if (!thread.Title) {
				reject(new Error('A thread has no title.'));
			}
			resolve();
		})
		.then(() => {
			return DB.knex('Threads').insert(thread);
		});
	}
	
	static getThread(id) {
		return DB.knex('Threads')
		.leftJoin('Boards', 'Threads.Board', 'Boards.ID')
		.where('Threads.ID', id).select('Boards.Name', 'Title', 'Threads.ID')
		.then((rows) => {
			if (!rows || rows.length <= 0) {
				return null;
			}
	
			return new Thread(rows[0]);
		});
	}
	
	static getThreadsInBoard(boardID) {
		return DB.knex('Threads')
		.leftJoin('Boards', 'Threads.Board', 'Boards.ID')
		.where('Boards.ID', boardID).select('Boards.Name', 'Title', 'Threads.ID')
		.then((rows) => {
			return rows.map((row) => new Thread(row));
		});
	}
}

module.exports = Thread;
