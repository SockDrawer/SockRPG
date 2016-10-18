'use strict';
/**
 * The controller for the Post API
 *
 *
 * @module postController
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

const Thread = require('../model/Thread');
const Post = require('../model/Post');

/**
* Add a post to a thread
* @param {Request} req Express' request object. Expects an ID under the params key
* @param {Response} res Express' response object.
* @returns {Promise} A Promise that is resolved when the thread is added
*/
function addPost(req, res) {
	//check if thread exists
	
	return Thread.getThread(req.params.id).then((thread) => {
		if (!thread) {
			res.status(404).end();
			return Promise.resolve();
		}

		const newPost = req.body || {};
		newPost.Thread = req.params.id;
		
		
		return Post.addPost(newPost).then((ids) => {
			const ret = {
				id: ids[0]
			};
			res.status(200).send(JSON.stringify(ret));
		}).catch((err) => {
			//debug('ERROR ADDING POST: ' + err);
			res.status(500).send(`ERROR: ${err.toString()}\n Post was ${JSON.stringify(req.body)}`);
		});
	});
}

/**
* Get a single post by ID
* @param {Request} req Express' request object. Expects an ID under the params key
* @param {Response} res Express' response object.
* @returns {Promise} A Promise that is resolved when the thread is added
*/
function getPost(req, res) {
	return Post.getPostByID(req.params.id).then((post) => {
		if (!post) {
			res.status(404).end();
			return Promise.resolve();
		}
		
		res.status(200).send(JSON.stringify(post.serialize()));
	});
}

const controller = {
	addPost: addPost,
	getPost: getPost
};

module.exports = controller;
