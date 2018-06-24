'use strict';

//Testing modules
const chai = require('chai'),
	chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const Sinon = require('sinon');
require('sinon-as-promised');

//Module to test
const Post = require('../../../src/model/Post.js');
const DB = require('../../../src/model/db');


describe('Post model', () => {
	let sandbox;
    
	beforeEach(() => {
		return Promise.resolve().then(() => {
			sandbox = Sinon.sandbox.create();
		})
		.then(() => DB.initialise({
			database: {
				filename: ':memory:'
			}
		})).then(() => DB.knex('Users').insert({
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
		}))
		.then(() => DB.knex('Threads').insert({
			ID: 2,
			Title: 'test thread 2',
			Board: 1
		}));
	});

	afterEach(() => {
		return Promise.resolve().then(() => DB.teardown())
		.then(() => {
			sandbox.restore();
		});
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
		
		return Post.addPost(post)
			.then(() => Post.getPostsInThread(1))
			.should.eventually.contain(new Post(post));
	});
	
	it('should not return other threads', () => {
		const post1 = {
			ID: 1,
			Thread: 1,
			Body: 'Manah manah (do-doo do-do doo)'
		};
		
		const post2 = {
			ID: 2,
			Thread: 2,
			Body: 'blah'
		};
		
		return Post.addPost(post1)
			.then(() => Post.addPost(post2))
			.then(() => Post.getPostsInThread(1))
			.should.eventually.not.contain(new Post(post2));
	});
});
