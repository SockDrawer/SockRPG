'use strict';

/**
 * Static Resource Controller; primarily used for serving images and avatars.
 *
 * Note: In most set-ups, SockRPG will be running behind a webserver
 * which will be set up to serve static content directly; this module exists
 * for the few set-ups that don't, and for development and debugging purposes.
 *
 * @module staticController
 * @license MIT
 * @author RaceProUK
 */

const url = require('url'),
	fs = require('fs'),
	path = require('path');

exports.serve = function serve(request, response) {
	let filename = '';
	if (url.parse(request.url).pathname === '/') {
		filename = path.join(process.cwd(), '/static/templates/index.html');
	} else {
		filename = path.join(process.cwd(), url.parse(request.url).pathname);
	}
	fs.exists(filename, (exists) => {
		if (!exists) {
			response.writeHead(404);
			response.end();
			return;
		}
		fs.readFile(filename, 'binary', (err, file) => {
			if (err) {
				response.writeHead(500);
				response.end();
				return;
			}
			response.writeHead(200);
			response.write(file, 'binary');
			response.end();
		});
	});
};
