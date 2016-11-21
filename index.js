#!/usr/bin/env node
"use strict";

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
	.command('help')
  .action(help);

program
	.command('show conf')
  .action(showConfig);

program
	.command('*')
  .action(help);

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
	
	nconf.set('config:grafana:url', process.argv[3]);
	saveConfig();
}

function help() {
	console.log('\nUsage: wizzy [commands]');
	console.log('\n Commands:');
	console.log('\n  wizzy init GRAFANA_URL')
	console.log('\t- initializes and connects wizzy to Grafana');
	console.log('\n  wizzy use org ORG_NAME');
	console.log('\t- switches wizzy\'s context to an org');
	console.log('\n  wizzy create dashboard DASHBOARD_NAME');
	console.log('\t- creates a new dashboard');
	console.log('\n  wizzy use dashboard DASHBOARD_NAME');
	console.log('\t- switches wizzy\'s context to a dashboard');
	console.log('\n');
}

function showConfig() {
	console.log(prettyjson.render(nconf.get('config')));
}

function saveConfig() {
	nconf.save(function (err) {
  	fs.readFile(confFile, function (err, data) {
    	console.dir(JSON.parse(data.toString()))
  	});
	});
}