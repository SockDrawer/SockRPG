'use strict';

//Testing modules
const chai = require('chai'),
	chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const Sinon = require('sinon');
require('sinon-as-promised');

//Module to test

const Text = require('../../../src/model/Text.js');
const DB = require('../../../src/model/db');

describe('Static text model', () => {
	let sandbox;
	
	beforeEach(() => {
		sandbox = Sinon.sandbox.create();
		return DB.initialise({
			database: {
				filename: ':memory:'
			}
		});
	});
	
	afterEach(() => {
		sandbox.restore();
		return DB.teardown();
	});
	
	it('should get text for a slot', () => {
		return Text.getTextForSlot('home_overview').should.eventually.be.ok;
	});
	
	it('should set text for a slot', () => {
		return Text.getTextForSlot('home_overview').then((text) => {
			text.text = 'This shit is bananas';
			Text.getTextForSlot('home_overview').should.eventually.deep.equal({
				data: {
					name: 'home_overview',
					text: 'This shit is bananas'
				},
				Canonical: '/api/text/home_overview'
			});
		});
	});
});
