'use strict';

//Testing modules
const chai = require('chai'),
	chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;

chai.should();
chai.use(chaiAsPromised);

const Sinon = require('sinon');
require('sinon-as-promised');

//Module to test
const Post = require('../../../src/model/Post.js');
const Thread = require('../../../src/model/Thread.js');
const DB = require('../../../src/model/db');


describe('Post model', () => {
	let sandbox;
    
	beforeEach(() => {
		sandbox = Sinon.sandbox.create();
		return DB.initialise({
			client: 'sqlite3',
			connection: {
				filename: ':memory:'
			},
			useNullAsDefault: true
		}).then(() => DB.knex('Users').insert({
			ID: 1,
			Username: 'test user'
		})).then(() => DB.knex('Boards').insert({
			ID: 1,
			Name: 'test board',
			Owner: 1
		}))
		.then(() => DB.knex('Threads').insert({
			ID: 1,
			Title: 'test thread',
			Board: 1
		}));
	});

	afterEach(() => {
		sandbox.restore();
		return DB.teardown();
	});
	
	it('should add a post to a thread', () => {
		return Post.addPost({
			Thread: 1,
			Body: 'This is a post'
		}).should.eventually.contain(1);
	});
	
	
	it('should find a post by ID', () => {
		return Post.addPost({
			Thread: 1,
			Body: 'This is a post'
		}).then(() => Post.getPostByID(1)).should.eventually.contain.all({ID: 1});
	});
	
	it('should find a post by thread', () => {
		const post = {
			ID: 1,
			Thread: 1,
			Body: 'Manah manah (do-doo do-do doo)'
		};
		
		return Post.addPost(post).then(() => Post.getPostsInThread(1)).should.eventually.contain.all(new Post(post));
	});
});
