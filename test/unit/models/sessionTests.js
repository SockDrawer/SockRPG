'use strict';

//Testing modules
const Chai = require('chai');
const expect = Chai.expect;
const Sinon = require('sinon');

const sinonChai = require('sinon-chai');
Chai.use(sinonChai);


//Module to test
const Session = require('../../../src/model/Session.js');


describe('Session model', () => {
	let sandbox;

	beforeEach(() => {
		sandbox = Sinon.createSandbox();
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('Can get session when logged out', async () => {
		const fakeReq = {
			csrfToken: () => 'fakeCsrfToken123'
		};
		
		const obj = await Session.getSession(fakeReq);
		
		expect(obj).to.be.a('object');
		expect(obj.CsrfToken).to.equal('fakeCsrfToken123');
		expect(obj.Username).to.equal(null);
		expect(obj.UserID).to.equal(null);
	});
	
	it('Can get session when logged in', async () => {
		const fakeReq = {
			csrfToken: () => 'fakeCsrfToken456',
			user: {
				ID: 1,
				Username: 'testUser'
			}
		};
		
		const obj = await Session.getSession(fakeReq);
		
		expect(obj).to.be.a('object');
		expect(obj.CsrfToken).to.equal('fakeCsrfToken456');
		expect(obj.Username).to.equal('testUser');
		expect(obj.UserID).to.equal(1);
	});
	
	it('Session model serialize works correctly', async () => {
		const fakeReq = {
			csrfToken: () => 'fakeCsrfToken789',
			user: {
				ID: 2,
				Username: 'otherUser'
			}
		};
		
		const obj = await Session.getSession(fakeReq);
		
		expect(obj.serialize()).to.deep.equal({
			Canonical: '/api/session',
			CsrfToken: 'fakeCsrfToken789',
			UserID: 2,
			Username: 'otherUser'
		});
	});
});
