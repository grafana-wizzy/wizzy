#!/usr/bin/env node
"use strict";

// Setting up directory structure
var dashDir = 'dashboards';
var confDir = 'conf';
var confFile = 'conf/wizzy.json';

// Setting up cli version and commands
var program = require('commander').version('0.2.0');

var Commands = require('./commands.js');
var commands = new Commands(dashDir, confDir, confFile);

// Basic commands
commands.addCommand(program, 'help', commands.help, 'wizzy help',
	'shows all available commands for wizzy.');

commands.addCommand(program, 'init', commands.init, 'wizzy init',
	'creates conf file with conf and dashboards directories.');

commands.addCommand(program, 'status', commands.status, 'wizzy status',
	'checks if any configuration property and if .git directory exists.');

// Config commands
commands.addCommand(program, 'conf', commands.showConfig, 'wizzy conf',
	'shows wizzy configuration properties.');

commands.addCommand(program, 'set', commands.setConfig, 'wizzy set grafana CONFIG_NAME CONFIG_VALUE',
	'sets a configuration property for wizzy');

/*
// Wizzy commands
commands.addCommand(program, 'copy', commands.instruct, 'wizzy copy ENTITY ENTITY_NAME',
	'copies an entity from one position to another');

commands.addCommand(program, 'create', commands.instruct, 'wizzy create ENTITY ENTITY_NAME',
	'creates a new entity', 'wizzy create org my-org');

commands.addCommand(program, 'delete', commands.instruct, 'wizzy delete ENTITY ENTITY_NAME',
	'deletes an entity', 'wizzy delete org org_id');

commands.addCommand(program, 'export', commands.instruct, 'wizzy export ENTITY ENTITY_NAME',
	'exports an entity from local repo to Grafana');

commands.addCommand(program, 'import', commands.instruct, 'wizzy import ENTITY ENTITY_NAME',
	'imports an entity from Grafana to local repo');

commands.addCommand(program, 'move', commands.instruct, 'wizzy move ENTITY ENTITY_NAME',
	'moves an entity from one position to another');

commands.addCommand(program, 'show', commands.instruct, 'wizzy show ENTITY ENTITY_NAME',
	'shows an entity', 'wizzy show org 1, wizzy show orgs');

commands.addCommand(program, 'summarize', commands.instruct, 'wizzy summarize ENTITY ENTITY_NAME',
	'summarize a large entity in a short user-friendly manner');
*/

// For any unsupported command wizzy will show help
program.command('*').action(commands.instruct);

// If there is no argument also, we will show help
program.parse(process.argv);
if (process.argv.length < 3) {
	commands.help();
}