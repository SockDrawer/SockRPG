'use strict';

exports.up = (knex, Promise) => {
	return Promise.all([
		knex.schema.createTable('Games', (table) => {
			table.increments('ID').primary();
			table.string('gameDescription');
		}),
		knex.schema.createTable('Users', (table) => {
			table.increments('ID').primary();
			table.string('Username').notNullable().unique();
			table.boolean('Admin').notNullable().defaultTo(false);
			table.string('AuthSecret').notNullable();
		}),
		knex.schema.createTable('Boards', (table) => {
			table.increments('ID').primary();
			//This shouldn't be nullable, but we don't have users working yet
			table.integer('Owner').references('Users.ID'); //.notNullable();
			table.integer('ParentID').references('Boards.ID').nullable();
			table.integer('GameID').references('Games.ID').nullable();
			table.string('Name').notNullable();
			table.boolean('Adult').defaultTo(false);
			table.string('Description').notNullable().defaultTo('');
		}),
		knex.schema.createTable('Threads', (table) => {
			table.increments('ID').primary();
			table.string('Title').notNullable();
			table.integer('Board').references('Boards.ID').notNullable();
		}),
		knex.schema.createTable('Posts', (table) => {
			table.increments('ID').primary();
			table.integer('Thread').references('Threads.ID').notNullable();
			table.string('Body').notNullable();
			table.integer('Poster').references('Users.ID');
			table.timestamps(false, true);
		})
	]);
};

exports.down = (knex, Promise) => {
	return Promise.all([
		knex.schema.dropTable('Games'),
		knex.schema.dropTable('Users'),
		knex.schema.dropTable('Boards'),
		knex.schema.dropTable('Threads'),
		knex.schema.dropTable('Posts')
	]);
};
