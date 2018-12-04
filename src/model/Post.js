'use strict';
const DB = require('./db');
const moment = require('moment');
const User = require('./User.js');

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

		//Things that come from the table go into this.data
		//Things that don't, calculated values, don't go there
		//that way they don't get synced back to the table
		this.data.ID = rowData.ID;
		this.data.Body = rowData.Body;
		this.data.Thread = rowData.Thread;
		this.data.Poster = rowData.Poster;
		this.DisplayName = rowData.DisplayName;
		this.data.created_at = rowData.created_at;
		if (!this.data.created_at) {
			this.data.created_at = new Date();
		}
		
		this.Canonical = `/api/posts/${this.ID}`;
	}

	get ID() {
		return this.data.ID;
	}
	
	get Thread() {
		return this.data.Thread;
	}

	get Body() {
		return this.data.Body;
	}
	
	get Created() {
		return moment(this.data.created_at);
	}

	get Poster() {
		return this.data.Poster;
	}
	
	get PosterName() {
		return this.DisplayName;
	}
	
	set Created(value) {
		if (!(value instanceof moment)) {
			value = moment(value);
		}
		this.data.created_at = moment(value).utc().toDate();
	}

	set Body(newBody) {
		this.data.Body = newBody;
	}
	
	set Thread(newThread) {
		this.data.Thread = newThread;
	}
	
	set Poster(user) {
		if (user instanceof User) {
			this.data.Poster = user.ID;
			this.data.DisplayName = user.DisplayName;
		} else {
			this.data.Poster = user;
		}
	}

	serialize() {
		const serial = JSON.parse(JSON.stringify(this.data));
		serial.Canonical = this.Canonical;
		serial.Created = moment(this.data.created_at).format();
		serial.Poster = this.Poster;
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
		.leftJoin('Users', 'Posts.Poster', 'Users.ID')
		.where('Posts.ID', id).select('Posts.ID', 'Body', 'Posts.Thread', 'Posts.created_at', 'Posts.Poster', 'Users.DisplayName')
		.then((rows) => {
			if (!rows || rows.length <= 0) {
				return null;
			}

			return new Post(rows[0]);
		});
	}

	static getPostsInThread(threadID) {
		return DB.knex('Posts')
		.leftJoin('Users', 'Posts.Poster', 'Users.ID')
		.where('Posts.Thread', threadID)
		.select('Posts.ID', 'Body', 'Posts.Thread', 'Posts.created_at', 'Posts.Poster', 'Users.DisplayName')
		.orderBy('Posts.created_at', 'asc')
		.then((rows) => {
			return rows.map((row) => new Post(row));
		});
	}
}

module.exports = Post;
