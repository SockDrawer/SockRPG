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


class Post {
	constructor (rowData) {
		this.data = {};
		this.data.ID = rowData.ID;
		this.data.Body = rowData.Body;
		this.data.Thread = rowData.Thread;
		this.Canonical = `/api/posts/${this.ID}`;
		this.Thread = rowData.Thread;
	}

	get ID() {
		return this.data.ID;
	}

	get Body() {
		return this.data.Body;
	}

	set Body(newBody) {
		this.data.Body = newBody;
	}

	serialize() {
		const serial = JSON.parse(JSON.stringify(this.data));
		serial.Canonical = this.Canonical;
		return serial;
	}

	save() {
		return DB.knex('Posts').where('ID', this.ID).update(this.data);
	}


	static addPost(post) {
		if (!(post instanceof Post)) {
			post = new Post(post);
		}

		return DB.knex('Posts').insert(post.data);
	}

	static getPostByID(id) {
		return DB.knex('Posts')
		.where('Posts.ID', id).select('ID', 'Body')
		.then((rows) => {
			if (!rows || rows.length <= 0) {
				return null;
			}

			return new Post(rows[0]);
		});
	}

	static getPostsInThread(threadID) {
		return DB.knex('Posts')
		.where('Posts.Thread', threadID)
		.select('Posts.ID', 'Body', 'Posts.Thread')
		.then((rows) => {
			return rows.map((row) => new Post(row));
		});
	}
}

module.exports = Post;
