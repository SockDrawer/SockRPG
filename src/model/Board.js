'use strict';

/**
 * The Board table.
 *
 * *Note: This module is _not_ intended to be used directly; use the DAO module for all data access.*
 *
 * @module User
 * @license MIT
 * @author RaceProUK
 */

const Sequelize = require('sequelize');

module.exports = (db, specs) => {
	return db.define('Board', {
		ID: specs.pk,
		Title: {
			type: Sequelize.STRING(255),
			allowNull: false
		}
	});
};
