/*global suite, bench */
'use strict';

const handlebars = require('handlebars');
require('marko/node-require').install();
const pug = require('pug');

const fs = require('fs');

const data = {
	User: {
		name: 'Accalia',
		avatar: 'http://placehold.it/50x50'
	},
	ID: 1,
	Body: 'Somewhere over the rainbow?',
	Timestamp: new Date().toISOString()
}


suite('Post template', () => {
	let precompiledHandlebars, precompiledMarko;
	
	  before(function(next) {
	    fs.readFile('./post.handlebars', 'utf8', (err, file) => {
			if (err) {
				throw err;
			}
			
			precompiledHandlebars = handlebars.compile(file);
			precompiledMarko = require('./post.marko');
			
			next();
	    });
	  });
  
	bench('handlebars', (next) => {
		fs.readFile('./post.handlebars', 'utf8', (err, file) => {
			if (err) {
				throw err;
			}
			
			const template = handlebars.compile(file);
			template(data);
			setImmediate(next);
		});
	});
	
	bench('handlebars precompiled', (next) => {
		precompiledHandlebars(data);
		setImmediate(next);
	});
	
	bench('marko', (next) => {
		const template = require('./post.marko');
		template.render(data, () => {
			//throw away the render output
			setImmediate(next);
		});
	});
	
	bench('marko precompiled', (next) => {
		precompiledMarko.render(data, () => {
			//throw away the render output
			setImmediate(next);
		});
	}); 
	
	bench('pug', (next) => {
		const template = pug.renderFile('./post.pug', data, next);
	});
});
