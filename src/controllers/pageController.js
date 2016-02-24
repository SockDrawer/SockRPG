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
const apiController = require ('apiController');

/**
 * Get the home page to hand to the view
 * @param  {Request} req The Express request object
 * @param  {Response} res The Express response object
 * @returns {Object}     A promise for the data for the view
 */
function getHomePage (req, res) {
	const data = {};

	return Promise.resolve(data);
}

const controller = {
	getHomePage: getHomePage
};

module.exports = controller;
