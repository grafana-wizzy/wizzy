#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('./logger.js');
var logger = new Logger();

// Setting up commands for cli
var program = require('commander');
program.version('1.0.0');
var Commands = require('./commands.js');
var commands = new Commands(program);

// Setting up wizzy commands in this function
commands.addCommand(program, 'init', commands.initWizzy, 'wizzy init',
	'initializes and connects wizzy to Grafana', 'wizzy init http://localhost:3000');

commands.addCommand(program, 'grafana', commands.setGrafanaConfig, 'wizzy grafana CONFIG_NAME CONFIG_VALUE',
	'sets Grafana config options for wizzy', 'wizzy grafana url http://localhost:3000');

commands.addCommand(program, 'status', commands.showStatus, 'wizzy status',
	'tests Github and Grafana setup for wizzy and return status');

commands.addCommand(program, 'help', commands.showHelp, 'wizzy help',
	'shows all available commands');

commands.addCommand(program, 'conf', commands.showConfig, 'wizzy conf',
	'shows wizzy configuration');

commands.addCommand(program, 'create', commands.createEntity, 'wizzy create ENTITY ENTITY_NAME',
	'creates a new entity in Grafana', 'wizzy create dashboard my-dash');

commands.addCommand(program, 'use', commands.useEntity, 'wizzy use ENTITY ENTITY_NAME',
	'points context to an existing entity', 'wizzy use org my-org');

commands.addCommand(program, 'delete', commands.deleteEntity, 'wizzy delete ENTITY ENTITY_NAME',
	'deletes entity from Grafana', 'wizzy use org my-org');

// For any other command wizzy will show help
program.command('*').action(commands.showHelp);

// If there is no argument also, we will show help
program.parse(process.argv);
if (process.argv.length < 3) {
	commands.showHelp();
}