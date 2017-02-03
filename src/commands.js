#!/usr/bin/env node
"use strict";

var _ = require('lodash');
var Components = require('./local/components.js');
var Grafana = require('./remote/grafana.js');
var GNet = require('./remote/gnet.js');
var S3 = require('./remote/s3services.js');
var Config = require('./util/config.js');
var Dashlist = require('./local/dashlist.js');
var Logger = require('./util/logger.js');
var Help = require('./util/help.js');
var LocalFS = require('./util/localfs.js');
var localfs = new LocalFS();
var logger = new Logger('Commands');
var help = new Help();

var config;
var components;
var gnet;
var grafana;
var s3;
var dashlist;

function Commands() {
	config = new Config();
	if (config.statusCheck()) {
		components = new Components(config.getProperty('config'));
		grafana = new Grafana(config.getProperty('config'), components);
		s3 = new S3(config.getProperty('config'), components);
	}
	gnet = new GNet(components);
	dashlist = new Dashlist();
}

// Creates an entity in wizzy or Grafana
Commands.prototype.instructions = function() {

	/* Key points before editing the cases:
		1. case 'version' does not have to be defined as it comes from commander.js
		2. process.argv[0] - reserverd for `node`
		3. process.argv[1] - reserverd for `wizzy` or `index.js`
	*/

	var commands = _.drop(process.argv, 2);
	var command = commands[0];

	switch(command) {
		
		case 'help':
			help.showHelp();
			break;
		case 'init':
			config.initialize();
			break;
		case 'status':
			status();
			break;
		case 'conf':
			config.showProperty('config');
			break;
		case 'set':
			config.addProperty(_.drop(commands,1));
			break;
		case 'unset':
			config.removeProperty(_.drop(commands,1));
			break;
		case 'import':
			grafana.import(_.drop(commands));
			break;
		case 'export':
			grafana.export(_.drop(commands));
			break;
		case 'create':
			if (commands[1] === 'dash-list') {
				dashlist.createList(_.drop(commands, 2));
			} else {
				grafana.create(_.drop(commands));
			}
			break;
		case 'delete':
			if (commands[1] === 'dash-list') {
				dashlist.deleteList(_.drop(commands, 2));
			} else {
				grafana.delete(_.drop(commands));
			}
			break;
		case 'show':
			if (commands[1] === 'dash-list') {
				dashlist.showList(_.drop(commands, 2));
			} else {
				grafana.show(_.drop(commands));
			}
			break;
		case 'list':
			if (commands[1] === 'gnet') {
				gnet.list(_.drop(commands,2));
			} else if (commands[1] === 'panels') {
				components.list(_.drop(commands, 1));
			} else {
				grafana.list(_.drop(commands));
			}
			break;
		case 'clip':
			grafana.clip(_.drop(commands));
			break;
		case 'summarize':
			components.summarize(_.drop(commands));
			break;
		case 'change':
      components.change(_.drop(commands));
      break;
		case 'move':
			components.moveCopyOrRemove(commands);
			break;
		case 'copy':
			components.moveCopyOrRemove(commands);
			break;
		case 'remove':
			if (commands[1] === 'from-dash-list') {
				dashlist.removeDashboard(_.drop(commands, 2));
			} else {
				components.moveCopyOrRemove(commands);
			}
			break;
		case 'extract':
			components.extract(_.drop(commands));
			break;
		case 'insert':
			components.insert(_.drop(commands));
			break;
		case 'download':
			if (commands[1] === 'from-gnet') {
				gnet.download(_.drop(commands, 2));
			} else if (commands[1] === 'from-s3') {
				s3.download(_.drop(commands, 2));
			}
			break;
		case 'upload':
			if (commands[1] === 'to-s3') {
				s3.upload(_.drop(commands, 2));
			}
			break;
		case 'add':
			if (commands[1] === 'to-dash-list') {
				dashlist.addDashboard(_.drop(commands, 2));
			}
			break;
		case 'clear':
			if (commands[1] === 'dash-list') {
				dashlist.clearList(_.drop(commands, 2));
			}
			break;
		case 'switch':
			grafana.switch(_.drop(commands));
			break;
		default:
			logger.showError('Unsupported command called.');
			help.showHelp();
	}
};

// Shows wizzy status
function status() {

	var setupProblem = config.statusCheck(true);
	if (setupProblem) {
		var setupGit = localfs.checkExists('.git', '.git directory', true);
		if(setupGit) {
			logger.showResult('wizzy setup complete.');
		}
		else {
			logger.showResult('wizzy setup complete without Git.');
		}
	} else {
		logger.showError('wizzy setup incomplete.');
	}

}

module.exports = Commands;