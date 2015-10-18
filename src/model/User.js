'use strict';

/**
 * The User table.
 *
 * *Note: This module is _not_ intended to be used directly; use the DAO module for all data access.*
 *
 * @module User
 * @license MIT
 * @author RaceProUK
 */

const Sequelize = require('sequelize');

module.exports = (db, specs) => {
	return db.define('User', {
		ID: specs.pk,
		Username: {
			type: Sequelize.STRING(63),
			unique: true,
			allowNull: false
		}
	}, {
		indexes: [{fields: ['Username']}]
	});
};
