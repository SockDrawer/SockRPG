'use strict';

/**
 * The Game table.
 *
 * *Note: This module is _not_ intended to be used directly; use the DAO module for all data access.*
 *
 * @module Game
 * @license MIT
 * @author RaceProUK
 */

//const Sequelize = require('sequelize');

module.exports = (db, specs) => {
	return db.define('Game', {
		ID: specs.pk
	});
};
