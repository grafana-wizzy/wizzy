#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('./logger.js');
var logger = new Logger();

// Setting up version and commands for cli
var program = require('commander');
var version = '1.0.1';

var Commands = require('./commands.js');
var commands = new Commands(program, version);

// Setting up wizzy commands in this function
commands.addCommand(program, 'init', commands.initWizzy, 'wizzy init',
	'initializes and connects wizzy to Grafana', 'wizzy init http://localhost:3000');

commands.addCommand(program, 'grafana', commands.setGrafanaConfig, 'wizzy grafana CONFIG_NAME CONFIG_VALUE',
	'sets Grafana config options for wizzy', 'wizzy grafana url http://localhost:3000');

commands.addCommand(program, 'status', commands.showStatus, 'wizzy status',
	'tests Github and Grafana setup for wizzy and return status');

commands.addCommand(program, 'conf', commands.showConfig, 'wizzy conf',
	'shows wizzy configuration');

commands.addCommand(program, 'import', commands.importEntity, 'wizzy import dashboard DASHBOARD_NAME',
	'imports a dashboard from Grafana in local json file', 'wizzy import dashboard my-dash');

commands.addCommand(program, 'export', commands.exportEntity, 'wizzy export dashboard DASHBOARD_NAME',
	'exports a dashboard from local json file to Grafana', 'wizzy export dashboard my-dash');

commands.addCommand(program, 'create', commands.createEntity, 'wizzy create ENTITY ENTITY_NAME',
	'creates a new entity in Grafana', 'wizzy create org my-org');


// For any other command wizzy will show help
program.command('*').action(commands.showHelp);

// If there is no argument also, we will show help
program.parse(process.argv);
if (process.argv.length < 3) {
	commands.showHelp();
}