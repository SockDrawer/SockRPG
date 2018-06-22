'use strict';
/**
 * Controller for sessions, including login/logout capability
 *
 * @module sessionController
 * @license MIT
 * @author rednaxela
 */

/*Express typedefs*/

/**
  @typedef Request
  @type {object}
  @property {object} params - The parameters for the request
 /

/**
  @typedef Response
  @type {object}
  @function send - The function to send data to the client
  @function status - Set the status code for the response
*/

const Session = require('../model/Session');
const passport = require('passport');

/**
 * Get a session representation
 * @param {Request} req Express' request object.
 * @param {Response} res Express' response object.
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function getSession(req, res) {
	// Return 401 (forbidden) if requestion a session that isn't one's own
	if (req.params.id && req.params.id !== req.sessionID) {
		res.status(401).end();
		return Promise.resolve(null);
	}
	
	return Session.getSession(req).then((data) => {
		res.status(200).send(data).end();
	}).catch((err) => {
		console.log(err);
		res.status(500).send({error: err.toString()});
	});
}

/**
 * Express handler list to put together for PUT/POST session request handling
 * where Username and Passport fields are passed in to attempt to cause login.
 */
const addSession = [
	(req, rew) => {
		if (req.body) {
			req.body = {username: req.body.Username, password: req.body.Password};
		}
	},
	passport.authenticate('local'),
	getSession
];

/**
 * Log out of the current setting
 * @param {Request} req Express' request object.
 * @param {Response} res Express' response object.
  */
function deleteSession(req, res) {
	// Return 401 (forbidden) if deleting a session that isn't one's own
	if (req.params.id && req.params.id !== req.sessionID) {
		res.status(401).end();
		return;
	}
	
	req.logout();
	res.status(200).send({});
}

const controller = {
	getSession: getSession,
	addSession: addSession,
	deleteSession: deleteSession

};

module.exports = controller;
