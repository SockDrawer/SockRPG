'use strict';
/**
 * The controller for the user API
 *
 *
 * @module userController
 * @license MIT
 * @author yamikuronue
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

const User = require('../model/User');
const debug = require('debug')('SockRPG:controller:User');

/**
 * Get all users in the system
 * @param {Request} _ Express' request object. Expects an ID under the params key
 * @param {Response} res Express' response object.
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function getAllUsers(_, res) {
	return User.getAllUsers().then((data) => {
		res.send(data);
	}).catch((err) => {
		debug(`Error Retrieving Users: ${err.toString()}`);
		//TODO: Add Proper Logging
		res.status(500).send({error: err.toString()});
	});
}

/**
 * Get a single user.
 * @param {Request} req Express' request object. Expects an ID under the params key
 * @param {Response} res Express' response object.
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function getUser(req, res) {
	const handleData = (user) => {
		if (Array.isArray(user)) {
			user = user[0]; //Only the first user
		}

		if (!user) {
			res.status(404);
			return;
		}

		res.status(200).send(user.serialize());
	};

	const handleError = (err) => {
		debug(`Error Retrieving User: ${err.toString()}`);
		//TODO: Add Proper Logging
		res.status(500).send({error: err.toString()});
	};

	//Check if the ID is a number
	if (Number.parseInt(req.params.id, 10) == req.params.id) { //eslint-disable-line eqeqeq
		return User.getUser(req.params.id).then(handleData).catch(handleError);

	//Otherwise it's a name
	} else if (req.params.id) {
		return User.getUserByName(req.params.id).then(handleData).catch(handleError);
	}

	//Fallthrough if we did neither:
	res.status(501).send({error: 'Missing ID'});
	return Promise.resolve();
}

/**
 * Add a user to the collection.
 * @param {Request} req Express' request object. Expects a body with a name parameter
 * @param {Response} res Express' response object.
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function addUser(req, res) {
	return User.addUser(req.body).then((index) => {
		res.status(200).send({id: index[0]}).end();
	}).catch((err) => {
		debug(`Error Adding User: ${err.toString()}`);
		//TODO: Add Proper Logging
		res.status(500).send({error: err.toString()});
	});
}

/**
 * Update a user
 * @param {Request} req Express' request object. Expects a body with data and an ID under the params key
 * @param {Response} res Express' response object.
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function updateUser(req, res) {

	return User.getUser(req.params.id).then((user) => {
		if (user === null) {
			return res.status(404).end();
		}
		
		user.Username = req.body.Username || user.Username;

		return user.save();
	}).then(() => {
		res.status(200).end();
	}).catch((err) => {
		debug(`Error Updating User: ${err.toString()}`);
		//TODO: Add Proper Logging

		res.status(500).send({error: err.toString()});
	});
}

const controller = {
	getAllUsers: getAllUsers,

	getUser: getUser,

	addUser: addUser,

	updateUser: updateUser

};

module.exports = controller;
