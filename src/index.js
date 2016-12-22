#!/usr/bin/env node
"use strict";

// Setting up directory structure
var confDir = 'conf';
var datasourceDir = 'datasources';
var confFile = 'conf/wizzy.json';
var dashDir = 'dashboards';
var datasrcDir = 'datasources';
var orgsDir = 'orgs';
var tempVarsDir = 'template-vars';

// Setting up cli version and commands
var program = require('commander').version('0.5.1');

var Commands = require('./commands.js');
var commands = new Commands(dashDir, datasrcDir, orgsDir, tempVarsDir, confDir, confFile);

// For any unsupported command wizzy will show help
program.command('*').action(commands.instructions);

// If there is no argument also, we will show help
program.parse(process.argv);
if (process.argv.length < 3) {
	commands.help();
}