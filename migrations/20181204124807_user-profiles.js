'use strict';

exports.up = (knex) => {
	return knex.schema.alterTable('Users', (table) => {
		table.string('DisplayName');
		table.string('Avatar').defaultTo('');
	});
};

exports.down = (knex) => {
	return knex.schema.alterTable('Users', (table) => {
		table.dropColumn('DisplayName');
		table.dropColumn('Avatar');
	});
};
