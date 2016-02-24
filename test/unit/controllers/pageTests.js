'use strict';
const Path = require('path');
const Chai = require('chai');
const assert = Chai.assert;
const Sinon = require('sinon');
require('sinon-as-promised');

const page = require(Path.resolve(__dirname, '../../../src/controllers/pageController.js'));
const dao = require(Path.resolve(__dirname, '../../../src/dao.js'));

describe('Page API controller', () => {

	describe('Home page', () => {
		it('should exist', () => {
			assert.isFunction(page.getHomePage());
		});
	});
});
