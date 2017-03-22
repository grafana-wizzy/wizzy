#!/usr/bin/env node
"use strict";

// Setting up cli version and commands
var program = require('commander').version('0.5.9');

var Commands = require('./commands.js');
var commands = new Commands();

// For any unsupported command wizzy will show help
program.command('*').action(commands.instructions);

// If there is no argument also, we will show help
program.parse(process.argv);
if (process.argv.length < 3) {
	commands.help();
}
