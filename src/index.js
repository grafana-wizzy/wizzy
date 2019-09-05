#!/usr/bin/env node

const program = require('commander');

const Commands = require('./commands.js');

const commands = new Commands();

// For any unsupported command wizzy will show help
program.command('*').action(commands.instructions);

// If there is no argument also, we will show help
program.parse(process.argv);
if (process.argv.length < 3) {
  program.outputHelp();
}
