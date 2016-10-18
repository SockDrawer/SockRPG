'use strict';
/*global describe, it, browser*/
const Chai = require('chai');
const expect = Chai.expect;
const assert = Chai.assert;
const server = require('../../src/server.js');

describe('SockRPG', function() {
	this.timeout(50000);
	const url = process.env.CI ? 'http://localhost' :
		`http://localhost:${process.env.PORT}`; //run from c9
	
	before(() => {
		//Start server
		return server.setup();
	});
		
	after(() => {
		return server.stop();
	});
	
	it('should be able to add a board', () => {
		browser.url(url)
		.click('#addBoard h4'); //Add a Board
		
		browser.element('#bsModal')
			.waitForVisible();
			
		browser.setValue('input[name="name"]', 'A board')
		.setValue('textarea[name="description"]', 'This is a board')
		.click('#submitModal')
		.waitForVisible('div.alert-success');
		
		//Refresh the page
		browser.url(url);
		assert.ok(browser.element('div.boardList a[href="/board/1"]'),
			'A link to the new board should exist');
	});
	
	it('should be able to add a thread', () => {
		browser.url(`${url}/board/1`)
		.click('#addThread'); //Add a thread
		
		browser.element('#tModal')
			.waitForVisible();
			
		browser.setValue('input[name="Title"]', 'A thread')
		.click('#submitModal')
		.waitForVisible('div.alert-success');
		
		//Refresh the page
		browser.url(`${url}/board/1`);
		assert.ok(browser.element('div.boardList a[href="/thread/1"]'),
			'A link to the new thread should exist');
	});
	
	//NOTE: I can't get this working :( -yami
	
/*	it('should be able to add a post', () => {
		browser.url(`${url}/thread/1`)
		.click('#replyButton button'); //Reply
		
		browser.element('#replySubmit')
			.waitForVisible();
		
		//Go into the ckeditor iframe
	//	browser.frame(browser.element('#cke_editor1 iframe'));
	//	browser.element('body').keys('This is my post, my post this is.');
	
		//browser.element('#editor1').keys('This is my post, my post this is.');
		browser.execute('CKEDITOR.instances["editor1"].setData("This is my post, my post this is.")');
		browser.click('#replySubmit');
		
		//refresh
		browser.url(`${url}/thread/1`);
		
		expect(browser.element('body').getText())
			.to.contain('This is my post, my post this is');
	});*/
});
