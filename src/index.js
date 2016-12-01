#!/usr/bin/env node
"use strict";

// Setting up directory structure
var dashDir = 'dashboards';
var confDir = 'conf';
var confFile = 'conf/wizzy.json';

// Setting up cli version and commands
var program = require('commander').version('0.2.4');

var Commands = require('./commands.js');
var commands = new Commands(dashDir, confDir, confFile);

// For any unsupported command wizzy will show help
program.command('*').action(commands.instructions);

// If there is no argument also, we will show help
program.parse(process.argv);
if (process.argv.length < 3) {
	commands.help();
}