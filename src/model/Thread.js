'use strict';
const DB = require('./db');
const Post = require('./Post');
const User = require('./User');

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
		this.data.Board = rowData.Board;
		this.Canonical = `/api/threads/${rowData.ID}`;
		this.boardName = rowData.Name;
		this.PostCount = rowData.PostCount || 0;
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
		serial.PostCount = this.PostCount;
		return serial;
	}

	save() {
		return DB.knex('Threads').where('ID', this.ID).update(this.data);
	}

	async getThreadStatistics() {
		const posts = await Post.getPostsInThread(this.data.ID);
		posts.sort((a, b) => {
			if (a.Created.isSame(b.Created)) {
				return 0;
			}
			return a.Created.isBefore(b.Created) ? 1 : -1;
		});
		const lastPost = posts[0];

		const user = await User.getUser(lastPost.Poster);

		return {
			Posts: posts.length,
			LastPostTime: lastPost.Created.toDate(),
			LastPosterId: lastPost.Poster,
			LastPoster: user.Username
		};
	}


	static addThread(thread) {
		if (!(thread instanceof Thread)) {
			thread = new Thread(thread);
		}

		return new Promise((resolve, reject) => {
			if (!thread.Title) {
				reject(new Error('A thread has no title.'));
			}
			resolve();
		})
		.then(() => {
			return DB.knex('Threads')
				.insert(thread.data, true);
		});
	}

	static getThread(id) {

		return DB.knex('Threads')
		.leftJoin('Boards', 'Threads.Board', 'Boards.ID')
		.where('Threads.ID', id)
		.select('Boards.Name', 'Title', 'Threads.ID', DB.knex('Posts').count('ID').where('Posts.Thread', id).as('PostCount'))
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
		.where('Boards.ID', boardID)
		.select('Boards.Name', 'Title', 'Threads.ID', DB.knex('Posts').count('ID').whereRaw('Posts.Thread = Threads.ID').as('PostCount'))
		.then((rows) => {
			return rows.map((row) => new Thread(row));
		});
	}
}

module.exports = Thread;
