#!/usr/bin/env node
"use strict";

var program = require('commander');

program
  .version('1.0.0');

program
	.command('init')
	.description('initializes wizzy config')
  .action(init);

program
	.command('help')
	.description('prints help')
  .action(help);

program
	.command('*')
  .action(hello);

program
	.parse(process.argv);

if (process.argv.length < 3) {
	hello();
}

function init() {
	console.log('Hello init');
}

function help() {
	console.log('\nUsage: wizzy [commands]');
	console.log('\n Commands:');
	console.log('\n wizzy init GRAFANA_URL')
	console.log('\t- initializes and connects wizzy to Grafana');
	console.log('\n wizzy use org ORG_NAME');
	console.log('\t- switches wizzy\'s context to an org');
	console.log('\n wizzy create dashboard DASHBOARD_NAME');
	console.log('\t- creates a new dashboard');
	console.log('\n wizzy use dashboard DASHBOARD_NAME');
	console.log('\t- switches wizzy\'s context to a dashboard');
	console.log('\n');
}

function hello() {
	console.log('Hi, I am wizzy. Type `wizzy help` to learn my magic spells.')
}