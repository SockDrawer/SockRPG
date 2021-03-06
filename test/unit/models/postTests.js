'use strict';

//Testing modules
const chai = require('chai'),
	chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const Sinon = require('sinon');
const moment = require('moment');

//Module to test
const Post = require('../../../src/model/Post.js');
const User = require('../../../src/model/User.js');
const DB = require('../../../src/model/db');


describe('Post model', () => {
	let sandbox, clock;

	beforeEach(() => {
		return Promise.resolve().then(() => {
			sandbox = Sinon.createSandbox();
			clock = Sinon.useFakeTimers();
		})
		.then(() => DB.initialise({
			database: {
				client: 'sqlite3',
				connection: {
					filename: ':memory:'
				},
				useNullAsDefault: true
			}
		})).then(() => DB.knex('Users').insert({
			ID: 1,
			Username: 'test user',
			DisplayName: 'test user',
			Admin: false,
			AuthSecret: 'bcrypt:$2b$10$rDDmPJKXM4Tkd9gzavJK8eSfKYLdgvRypWqLQPN8UaXyQzvcEdnZC'
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
			clock.restore();
		});
	});

	it('should add a post to a thread', () => {
		return Post.addPost({
			Thread: 1,
			Body: 'This is a post',
			Poster: 1
		}).should.eventually.contain(1);
	});

	it('should add a post object to a thread', () => {
		return Post.addPost(new Post({
			Thread: 1,
			Body: 'This is a post',
			Poster: 1
		})).should.eventually.contain(1);
	});


	it('should find a post by ID', () => {
		return Post.addPost({
			Thread: 1,
			Body: 'This is a post',
			Poster: 1
		}).then(() => Post.getPostByID(1)).should.eventually.contain.all({ID: 1});
	});

	it('should not find a post by nonexistant ID', () => {
		const id = 10000 + Math.floor(Math.random() * 10000);
		return Post.getPostByID(id).should.eventually.equal(null);
	});

	it('should find a post by thread', () => {
		const post = {
			ID: 1,
			Thread: 1,
			Poster: 1,
			Body: 'Manah manah (do-doo do-do doo)',
			created_at: '2018-10-01 18:05:36',
			Username: 'kermit'
		};

		return Post.addPost(post)
			.then(() => Post.getPostsInThread(1))
			.then((posts) => {
				posts.length.should.equal(1);
				const dbpost = posts[0];
				post.Body.should.equal(dbpost.Body);
				dbpost.Thread.should.equal(1);
				dbpost.ID.should.equal(post.ID);
				moment(post.created_at).isSame(dbpost.Created).should.equal(true);
				dbpost.Poster.should.equal(1);
			});
	});

	it('should save and retrieve post', () => {
		const post = new Post({
			Body: `A Post ${Math.random()}`,
			Thread: 1,
			Poster: 1
		});
		let ID = undefined;
		return Post.addPost(post)
			.then((id) => {
				ID = id[0];
				return Post.getPostByID(ID);
			})
			.then((dbpost) => {
				post.Body.should.equal(dbpost.Body);
				dbpost.Thread.should.equal(1);
				dbpost.ID.should.equal(ID);
				moment().isSame(dbpost.Created).should.equal(true);
				dbpost.Poster.should.equal(1);
				dbpost.PosterName.should.equal('test user');
			});
	});

	it('should update post', () => {
		let post = new Post({
			Body: `A Post ${Math.random()}`,
			Thread: 1,
			Poster: 1
		});
		let ID = undefined;
		return Post.addPost(post)
			.then((id) => {
				ID = id[0];
				return Post.getPostByID(ID);
			})
			.then((dbpost) => {
				post = dbpost;
				post.Body = `Awesome new Body ${Math.random()}`;
				post.Thread = 2; //Moved post
				return post.save();
			})
			.then(() => Post.getPostByID(ID))
			.then((dbpost) => {
				post.data.should.deep.equal(dbpost.data);
			});
	});

	it('should not return other threads', () => {
		const post1 = {
			ID: 1,
			Thread: 1,
			Poster: 1,
			Body: 'Manah manah (do-doo do-do doo)'
		};

		const post2 = {
			ID: 2,
			Thread: 2,
			Poster: 1,
			Body: 'blah'
		};

		return Post.addPost(post1)
			.then(() => Post.addPost(post2))
			.then(() => Post.getPostsInThread(1))
			.should.eventually.not.deep.contain(new Post(post2));
	});
	
	it('should accept post date from controller', () => {
		const post = new Post({
			Body: `A Post ${Math.random()}`,
			Thread: 1,
			Poster: 1
		});
		
		const time = moment();
		
		post.Created = time;
		
		return moment(post.Created).isSame(time).should.be.true;
	});
	
	it('should accept post date from api', () => {
		const post = new Post({
			Body: `A Post ${Math.random()}`,
			Thread: 1,
			Poster: 1
		});
		
		const time = moment();
		
		post.Created = time.toJSON(); //pass it in as a JSON-compatible string      
		
		return moment(post.Created).isSame(time).should.be.true;
	});
	
	it('should accept poster from controller', () => {
		const user = new User({
			Username: 'testPerson',
			Admin: false,
			ID: 666
		});
		
		const post = new Post({
			Body: `A Post ${Math.random()}`,
			Thread: 1,
			Poster: 1
		});
		
		post.Poster = user;
		
		return post.Poster.should.deep.equal(666);
	});
	
	it('should accept poster from api', () => {
		const post = new Post({
			Body: `A Post ${Math.random()}`,
			Thread: 1,
			Poster: 1
		});
		
		post.Poster = 123;
		
		return post.Poster.should.deep.equal(123);
	});
});
