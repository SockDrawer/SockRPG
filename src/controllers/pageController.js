'use strict';

/**
 * The controller for the pages
 *
 *
 * @module pageController
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
const apiController = require ('./apiController');

/**
 * Get the home page to hand to the view
 * @param  {Request} req The Express request object
 * @param  {Response} res The Express response object
 * @returns {Promise} A promise that will resolve when the response has been sent.
 */
function getHomePage(req, res) {
	const data = {};
	
	return dao.getAllBoards().then((boards) => {
		data.boards = boards;
	})
	.then(() => {
		res.render('home', data);
	})
	.catch((err) => {
		//TODO: logging errors
		res.status(500).send({error: err.toString()});
	});
}

const controller = {
	getHomePage: getHomePage
};

module.exports = controller;
