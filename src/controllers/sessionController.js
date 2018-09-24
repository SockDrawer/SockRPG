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
const debug = require('debug')('SockRPG:controller:Session');

/**
 * Get a session representation
 * @param {Request} req Express' request object.
 * @param {Response} res Express' response object.
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function getSession(req, res) {
	return Session.getSession(req).then((data) => {
		res.status(200).send(data.serialize()).end();
	}).catch((err) => {
		debug(`Error Retrieving Session: ${err.toString()}`);
		res.status(500).send({error: err.toString()}).end();
	});
}

/**
 * Log out of the current setting
 * @param {Request} req Express' request object.
 * @param {Response} res Express' response object.
  */
function deleteSession(req, res) {
	req.logout();
	res.status(200).end();
}

/**
 * Express handler list to put together for PUT/POST session request handling
 * where Username and Passport fields are passed in to attempt to cause login.
 * @param {Request} req Express' request object.
 * @param {Response} res Express' response object.
 * @param {Object} next Express' next handler.
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
const addSession = [
	(req, res, next) => {
		if (req.body.Username === null) {
			req.logout();
			return getSession(req, res);
		}
		
		req.body = {username: req.body.Username, password: req.body.Password};
		return next();
	},
	passport.authenticate('local'),
	getSession
];

const controller = {
	getSession: getSession,
	addSession: addSession,
	deleteSession: deleteSession

};

module.exports = controller;
