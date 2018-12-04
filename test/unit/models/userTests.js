'use strict';

//Testing modules
const Chai = require('chai');
const Sinon = require('sinon');
const should = Chai.should();

const sinonChai = require('sinon-chai');
Chai.use(sinonChai);


//Module to test
const User = require('../../../src/model/User.js');
const DB = require('../../../src/model/db');

describe('User model', () => {
	let sandbox;

	beforeEach(() => {
		return Promise.resolve()
			.then(() => {
				sandbox = Sinon.createSandbox();
			})
			.then(() => DB.initialise({
				database: {
					client: 'sqlite3',
					connection: {
						filename: ':memory:'
					},
					useNullAsDefault: true
				}
			}));
	});

	afterEach(() => {
		return Promise.resolve().then(() => DB.teardown())
		.then(() => {
			sandbox.restore();
		});
	});

	const testUserData = {
		Username: 'testPerson',
		Admin: false,
		Password: 'superDuperSecret'
	};
	
	const testUserWithDisplay = {
		Username: 'testPerson',
		DisplayName: 'Test Person',
		Admin: false,
		Password: 'superDuperSecret'
	};
	
	const testAdminUserData = {
		Username: 'testAdmin',
		Admin: true,
		Password: 'extraSecret'
	};
	
	it('should add a user', () => {
		return User.addUser(testUserData).should.eventually.contain(1);
	});
	
	it('should default display name to username', () => {
		return User.addUser(testUserData)
		.then((ids) => User.getUser(ids[0]))
		.then((user) => user.DisplayName.should.equal('testPerson'));
	});	
	
	it('should allow display names', () => {
		return User.addUser(testUserWithDisplay)
		.then((ids) => User.getUser(ids[0]))
		.then((user) => user.DisplayName.should.equal('Test Person'));
	});

	it('should add an admin user', () => {
		return User.addUser(testAdminUserData).should.eventually.contain(1);
	});

	it('should get no users when no users added yet', async () => {
		return User.getAllUsers(testUserData).should.eventually.have.lengthOf(0);
	});
	
	it('should be able to get 1 user after 1 user added', async () => {
		await User.addUser(testUserData);
		
		return User.getAllUsers(testUserData).should.eventually.have.lengthOf(1);
	});
	
	it('should be able to get 2 users after 2 users added', async () => {
		await User.addUser(testUserData);
		await User.addUser(testAdminUserData);
		
		return User.getAllUsers(testUserData).should.eventually.have.lengthOf(2);
	});
	
	it('should be able to get a user by id', async () => {
		const userId = (await User.addUser(testUserData))[0];
		
		const user = await User.getUser(userId);
		
		return user.should.have.all.keys('data', 'Canonical');
	});
	
	it('should get null if no such user by id', async () => {
		await User.addUser(testUserData);
		
		const user = await User.getUser(42);
		
		return should.equal(user, null);
	});
	
	it('should be able to get a user ID', async () => {
		const userId = (await User.addUser(testUserData))[0];
		const user = await User.getUser(userId);
		
		return user.ID.should.equal(userId);
	});
	
	it('should be able to get Username', async () => {
		const userId = (await User.addUser(testUserData))[0];
		const user = await User.getUser(userId);
		
		return user.Username.should.equal(testUserData.Username);
	});
	
	it('should be able to get Admin', async () => {
		const userId = (await User.addUser(testUserData))[0];
		const user = await User.getUser(userId);
		
		return user.Admin.should.equal(testUserData.Admin);
	});
	
	it('should be able to get AuthSecret', async () => {
		const userId = (await User.addUser(testUserData))[0];
		const user = await User.getUser(userId);
		
		return user.AuthSecret.startsWith('bcrypt:').should.equal(true);
	});
	
	
	it('should be able to set Username', async () => {
		const userId = (await User.addUser(testUserData))[0];
		const user = await User.getUser(userId);
		
		const newUsername = 'Newbie';
		user.Username = newUsername;
		return user.Username.should.equal(newUsername);
	});
	
	it('should be able to set Admin', async () => {
		const userId = (await User.addUser(testUserData))[0];
		const user = await User.getUser(userId);
		
		user.Admin = true;
		return user.Admin.should.equal(true);
	});
	
	it('should be able to set AuthSecret', async () => {
		const userId = (await User.addUser(testUserData))[0];
		const user = await User.getUser(userId);
		
		const newAuthSecret = 'bcrypt:dummy';
		user.AuthSecret = newAuthSecret;
		return user.AuthSecret.should.equal(newAuthSecret);
	});
	
	it('should be able to serialize', async () => {
		const userId = (await User.addUser(testUserData))[0];
		const user = await User.getUser(userId);
		
		return user.serialize().should.have.all.keys('ID', 'Username', 'Admin', 'Avatar', 'Canonical', 'DisplayName');
	});
	
	it('should be able to save', async () => {
		const userId = (await User.addUser(testUserData))[0];
		const user = await User.getUser(userId);
		
		// Set username and save
		const newUsername = 'Newbie';
		user.Username = newUsername;
		await user.save();
		
		// Get and check
		const updatedUser = await User.getUser(userId);
		
		return updatedUser.Username.should.equal(newUsername);
	});
	
	it('should be able to change password', async () => {
		const userId = (await User.addUser(testUserData))[0];
		const user = await User.getUser(userId);
		
		const oldSecret = user.AuthSecret.toString();
		
		await user.changePassword('Password12345');
		
		return user.AuthSecret.should.not.equal(oldSecret);
	});
	
	it('should be able to get a user by username', async () => {
		await User.addUser(testUserData);
		
		const user = await User.getUserByName(testUserData.Username);
		
		return user.should.have.all.keys('data', 'Canonical');
	});
	
	it('should be able to fail to get a user by username', async () => {
		await User.addUser(testUserData);
		
		const user = await User.getUserByName('nobodyHereButUsChickens');
		
		return should.equal(user, null);
	});
	
	it('should be able to authenticate as user', async () => {
		const userId = (await User.addUser(testUserData))[0];
		const user = await User.getUser(userId);
		
		return User.authUserByPassword(user, testUserData.Password).should.eventually.equal(true);
	});
	
	it('should be able to fail to authenticate as user', async () => {
		const userId = (await User.addUser(testUserData))[0];
		const user = await User.getUser(userId);
		
		return User.authUserByPassword(user, 'Bogus').should.eventually.equal(false);
	});
	
	it('should fail to auth as user without valid AuthSecret data', async () => {
		const user = {
			AuthSecret: 'weirdo:uhhh'
		};
		
		return User.authUserByPassword(user, testUserData.Password).should.eventually.equal(false);
	});
	
	it('should be able to get and authenticate as user', async () => {
		const userId = (await User.addUser(testUserData))[0];
		const user = await User.getAuthenticatedUserByNameAndPassword(testUserData.Username, testUserData.Password);
		
		return user.should.have.all.keys('data', 'Canonical');
	});
	
	it('should be able to try to get and fail to authenticate as user', async () => {
		await User.addUser(testUserData);
		
		const user = await User.getAuthenticatedUserByNameAndPassword(testUserData.Username, 'Bogus');
		
		return should.equal(user, null);
	});
	
	it('should be able to try to get and fail to authenticate as user that doesn\'t exist', async () => {
		await User.addUser(testUserData);
		
		const user = await User.getAuthenticatedUserByNameAndPassword('Nope', 'Bogus');
		
		return should.equal(user, null);
	});
});
