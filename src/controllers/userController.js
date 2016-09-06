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

const dao = require('../dao.js');


/**
 * Get all users in the system
 * @param {Request} _ Express' request object. Expects an ID under the params key
 * @param {Response} res Express' response object.
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function getAllUsers(_, res) {
	return dao.getAllUsers().then((data) => {
		for (let i = 0; i < data.length; i++) {
			data[i].canonical = `/api/users/${data[i].id}`;
		}
		res.send(data);
	}).catch((err) => {
		//TODO: logging errors
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
	const handleData = (data) => {
		if (Array.isArray(data)) {
			data = data[0]; //Only the first game
		}

		if (!data) {
			res.status(404);
			return;
		}
		data.canonical = `/api/users/${data.id}`;

		res.send(data);
	};

	const handleError = (err) => {
		//TODO: logging errors
		res.status(500).send({error: err.toString()});
	};

	//Check if the ID is a number
	if (Number.parseInt(req.params.id, 10) == req.params.id) { //eslint-disable-line eqeqeq
		return dao.getUser(req.params.id).then(handleData).catch(handleError);

	//Otherwise it's a name
	} else if (req.params.id) {
		return dao.getUserByName(req.params.id).then(handleData).catch(handleError);
	}

	//Fallthrough if we did neither:
	res.status(501).send({error: 'Missing ID'});
	return Promise.resolve();
}

const controller = {
	getAllUsers: getAllUsers,

	getUser: getUser

};

module.exports = controller;
