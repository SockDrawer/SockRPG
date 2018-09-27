'use strict';
const Path = require('path');
const Chai = require('chai');
const Sinon = require('sinon');

const sinonChai = require('sinon-chai');
Chai.use(sinonChai);


const userControl = require(Path.resolve(__dirname, '../../../src/controllers/userController.js'));
const User = require('../../../src/model/User');

describe('User API controller', () => {
	let sandbox, mockResponse;

	beforeEach(() => {
		sandbox = Sinon.createSandbox();
		mockResponse = {
			send: sandbox.stub(),
			status: sandbox.stub(),
			end: sandbox.stub()
		};
		mockResponse.send.returns(mockResponse);
		mockResponse.status.returns(mockResponse);
		mockResponse.end.returns(mockResponse);
	});

	afterEach(() => {
		sandbox.restore();
	});
	
	describe('getAllUsers()', () => {
		it('should send user data', () => {
			const users = [new User({
				ID: 3
			})];
			sandbox.stub(User, 'getAllUsers').resolves(users);
			return userControl.getAllUsers(null, mockResponse)
				.then(() => mockResponse.send.should.be.calledWith(users));
		});
		it('should send 500 on error', () => {
			sandbox.stub(User, 'getAllUsers').rejects(new Error());
			return userControl.getAllUsers(null, mockResponse)
				.then(() => mockResponse.status.should.be.calledWith(500));
		});

		it('should send error message on error', () => {
			const error = new Error('Ummm... what\s up here?');
			sandbox.stub(User, 'getAllUsers').rejects(error);
			return userControl.getAllUsers(null, mockResponse)
				.then(() => {
					mockResponse.send.firstCall.args[0].should.deep.equal({
						error: error.toString()
					});
				});
		});
	});
	
	describe('getUser()', () => {
		it('should require ID parameter', () => {
			const mockRequest = {
				params: {}
			};
			return userControl.getUser(mockRequest, mockResponse)
				.then(() => {
					mockResponse.status.should.be.calledWith(501);
					mockResponse.send.firstCall.args[0].should.deep.equal({
						error: 'Missing ID'
					});
				});
		});

		it('should 404 for nonexistant user', () => {
			const mockRequest = {
				params: {
					id: 3
				}
			};
			sandbox.stub(User, 'getUser').resolves(null);
			return userControl.getUser(mockRequest, mockResponse)
				.then(() => {
					mockResponse.status.should.be.calledWith(404);
				});
		});

		it('should return user', () => {
			const expected = {
				Admin: false,
				Canonical: '/api/users/5',
				ID: 5,
				Username: 'joe'
			};
			const user = new User({
				ID: 5,
				Username: 'joe'
			});
			sandbox.stub(User, 'getUser').resolves(user);
			const mockRequest = {
				params: {
					id: 5
				}
			};
			return userControl.getUser(mockRequest, mockResponse)
				.then(() => {
					mockResponse.status.should.be.calledWith(200);
					mockResponse.send.firstCall.args[0].should.deep.equal(expected);
				});
		});
		
		it('should be able to get by username', () => {
			const expected = {
				Admin: false,
				Canonical: '/api/users/5',
				ID: 5,
				Username: 'joe'
			};
			const user = new User({
				ID: 5,
				Username: 'joe'
			});
			sandbox.stub(User, 'getUserByName').resolves(user);
			const mockRequest = {
				params: {
					id: 'joe'
				}
			};
			return userControl.getUser(mockRequest, mockResponse)
				.then(() => {
					mockResponse.status.should.be.calledWith(200);
					mockResponse.send.firstCall.args[0].should.deep.equal(expected);
				});
		});

		it('should handle errors', () => {
			const error = new Error('Nope nope nope nope!');
			sandbox.stub(User, 'getUser').rejects(error);
			const mockRequest = {
				params: {
					id: 4
				}
			};
			return userControl.getUser(mockRequest, mockResponse)
				.then(() => {
					mockResponse.status.should.be.calledWith(500);
					mockResponse.send.firstCall.args[0].should.deep.equal({
						error: error.toString()
					});
				});
		});
	});
	
	describe('addUser()', () => {
		it('should add user to DB', () => {
			const expected = {
				Username: 'XXXsomeoneXXX'
			};
			sandbox.stub(User, 'addUser').resolves([1]);
			return userControl.addUser({
				body: expected
			}, mockResponse).then(() => {
				User.addUser.should.be.calledWith(expected);
			});
		});
		it('should return ID of added user', () => {
			const expected = Math.random();
			sandbox.stub(User, 'addUser').resolves([expected]);
			return userControl.addUser({
				body: {}
			}, mockResponse).then(() => {
				mockResponse.status.should.be.calledWith(200);
				mockResponse.send.firstCall.args[0].should.deep.equal({
					id: expected
				});
			});
		});
		it('should handle error', () => {
			const expected = new Error('Bad!');
			sandbox.stub(User, 'addUser').rejects(expected);
			return userControl.addUser({
				body: {}
			}, mockResponse).then(() => {
				mockResponse.status.should.be.calledWith(500);
				mockResponse.send.firstCall.args[0].should.deep.equal({
					error: expected.toString()
				});
			});
		});
	});
	
	describe('updateUser()', () => {
		it('should change Username', () => {
			const user = new User({
				Username: 'XXXsomeoneXXX'
			});
			const expected = 'aMoreRespectableName';
			sandbox.stub(user, 'save').resolves();
			sandbox.stub(User, 'getUser').resolves(user);
			return userControl.updateUser({
				body: {
					Username: expected
				},
				params: {
					id: 1
				}
			}, mockResponse).then(() => {
				user.save.called.should.equal(true);
				user.Username.should.equal(expected);
			});
		});
		it('update with no username', () => {
			const user = new User({
				Username: 'XXXsomeoneXXX'
			});
			sandbox.stub(user, 'save').resolves();
			sandbox.stub(User, 'getUser').resolves(user);
			return userControl.updateUser({
				body: {},
				params: {
					id: 1
				}
			}, mockResponse).then(() => {
				user.save.called.should.equal(true);
				user.Username.should.equal('XXXsomeoneXXX');
			});
		});
		it('should resolve with status 200 on success', () => {
			const user = new User({
				Username: 'XXXsomeoneXXX'
			});
			sandbox.stub(user, 'save').resolves();
			sandbox.stub(User, 'getUser').resolves(user);
			return userControl.updateUser({
				body: {
					Username: 'wooosh'
				},
				params: {
					id: 1
				}
			}, mockResponse).then(() => {
				mockResponse.status.should.be.calledWith(200);
			});
		});

		it('should resolve with status 404 on not found', () => {
			sandbox.stub(User, 'getUser').resolves(null);
			return userControl.updateUser({
				body: {},
				params: {
					id: 1
				}
			}, mockResponse).then(() => {
				mockResponse.status.should.be.calledWith(404);
			});
		});
		it('should resolve with status 404 on not found', () => {
			const err = new Error('What is up here!');
			sandbox.stub(User, 'getUser').rejects(err);
			return userControl.updateUser({
				body: {},
				params: {}
			}, mockResponse).then(() => {
				mockResponse.status.should.be.calledWith(500);
			});
		});
	});
});
