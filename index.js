#!/usr/bin/env node
"use strict";

// Creating Grafana object
var Grafana = require('./src/grafana.js');
var grafana;

// Setting prettyjson object
var prettyjson = require('prettyjson');

// Setting up defaults
var fs    = require('fs');
var nconf = require('nconf');
var confFile = 'conf/wizzy.json';

nconf.argv()
	.env()
 	.file({ file: confFile });

// Setting up commands
var program = require('commander');
program
  .version('1.0.0');

program
	.command('init')
  .action(init);

program
	.command('reset')
	.action(reset);

program
	.command('help')
  .action(help);

program
	.command('conf')
  .action(showConfig);

program
	.command('*')
  .action(help);

program
	.command('create')
	.action(create);

program
	.parse(process.argv);

if (process.argv.length < 3) {
	hello();
}

function init() {
	// Initializing conf dir
	var confDir = 'conf';
	if (!fs.existsSync(confDir)){
    fs.mkdirSync(confDir);
	}

	// Initializing dashboard dir
	var dashDir = 'dashboards';
	if (!fs.existsSync(dashDir)){
    fs.mkdirSync(dashDir);
	}

	if (nconf.get('config:grafana:url')) {
		console.log('wizzy already initialized. use `wizzy update`');
	} else {
		reset();
	}
}

function help() {
	console.log('\nUsage: wizzy [commands]');
	console.log('\n Commands:');
	console.log('\n  wizzy init GRAFANA_URL')
	console.log('\t- initializes and connects wizzy to Grafana');
	console.log('\t- Example: wizzy init http://localhost:3000');
	console.log('\n  wizzy create org ORG_NAME');
	console.log('\t- creates a new org in Grafana');
	console.log('\t- Example: wizzy create org my_org');
	console.log('\n  wizzy use org ORG_NAME');
	console.log('\t- switches wizzy\'s context to an org');
	console.log('\n  wizzy create dashboard DASHBOARD_NAME');
	console.log('\t- creates a new dashboard');
	console.log('\n  wizzy use dashboard DASHBOARD_NAME');
	console.log('\t- switches wizzy\'s context to a dashboard');
	console.log('\n  wizzy reset GRAFANA_URL')
	console.log('\t- resets Grafana URL in config');
	console.log('\t- Example: wizzy reset http://localhost:6000');
	console.log('\n  wizzy help')
	console.log('\t- shows all available commands');
	console.log('\n');
}

function showConfig() {
	console.log(prettyjson.render(nconf.get('config')));
}

function reset() {
	nconf.set('config:grafana:url', process.argv[3]);
	saveConfig();
	console.log("Configuration updated successfully.")
}

function saveConfig() {
	nconf.save(function (err) {
  	fs.readFile(confFile, function (err, data) {
    	if (err != null) {
    		console.err(err);
    	}
  	});
	});
}

function loadConfig() {
	grafana = new Grafana(nconf.get('config:grafana:url'));
}

function create() {
	loadConfig();
	grafana.create(process.argv[3], process.argv[4]);
}