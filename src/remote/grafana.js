#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('../util/logger.js');
var logger = new Logger('grafana');
var LocalFS = require('../util/localfs.js');
var localfs = new LocalFS();
var ImportSrv = require('./grafana/importSrv.js');
var importSrv;
var ExportSrv = require('./grafana/exportSrv.js');
var exportSrv;
var ClipSrv = require('./grafana/clipSrv.js');
var clipSrv;

var _ = require('lodash');
var request = require('request');
var Table = require('cli-table');

function Grafana(conf, comps) {
	if (conf && conf.grafana) {
		if (conf.context && conf.context.grafana) {
			if (conf.context.grafana in conf.grafana.envs) {
				conf.grafana = conf.grafana.envs[conf.context.grafana];
			}
		}
		if (conf.grafana.url) {
			this.grafanaUrl = conf.grafana.url;
		}
		if (conf.grafana.api_key) {
			this.auth = {
				bearer: conf.grafana.api_key
			};
		}	else if (conf.grafana.username && conf.grafana.password) {
			this.auth = {
				username: conf.grafana.username,
				password: conf.grafana.password
			};
		}
		if (conf.grafana.headers) {
			this.headers = conf.grafana.headers;
		}
		if (conf.grafana.installations) {
			this.installations = conf.grafana.installations;
		}
	}
	if (comps) {
		this.components = comps;
		importSrv = new ImportSrv(this.components);
		exportSrv = new ExportSrv(this.components);
	}
	if (conf && conf.clip) {
		this.clipConfig = conf.clip;
		clipSrv = new ClipSrv(conf.clip);
	}
}

// creates an org
Grafana.prototype.create = function(commands) {
	var self = this;
	var successMessage;
	var failureMessage;
	var entityType = commands[0];
	var entityValue = commands[1];
	var body = {};
	if (entityType === 'org') {
		body.name = entityValue;
		successMessage = 'Created Grafana org ' + entityValue + ' successfully.';
		failureMessage = 'Error in creating Grafana org ' + entityValue + '.';
	} else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	var options = self.setURLOptions();
	options.url = self.grafanaUrl + self.createURL('create', entityType, entityValue);
	options.body = body;
	request.post(options, function printResponse(error, response, body) {
		var output = '';
		if (!error && response.statusCode === 200) {
  			output += logger.stringify(body);
  			logger.showOutput(output);
			logger.showResult(successMessage);
		} else {
			output += 'Grafana API response status code = ' + response.statusCode;
			if (error === null) {
				output += '\nNo error body from Grafana API.';
			}
			else {
				output += '\n' + error;
			}
			logger.showOutput(output);
			logger.showError(failureMessage);
		}
	});
};

// deletes a dashboard or an org
Grafana.prototype.delete = function(commands) {
	var self = this;
	var entityType = commands[0];
	var entityValue = commands[1];
	var successMessage;
	var failureMessage;
	if (entityType === 'org') {
		successMessage = 'Deleted Grafana org ' + entityValue + ' successfully.';
		failureMessage = 'Error in deleting Grafana org ' + entityValue + '.';
	} else if (entityType === 'dashboard') {
		successMessage = 'Deleted Grafana dashboard ' + entityValue + ' successfully.';
		failureMessage = 'Error in deleting Grafana dashboard ' + entityValue + '.';
	} else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	var options = self.setURLOptions();
	options.url = self.grafanaUrl + self.createURL('delete', entityType, entityValue);
	request.delete(options, printResponse);
	logger.showResult(successMessage);
};

// shows Grafana entities
Grafana.prototype.show = function(commands) {
	var self = this;
	var entityType = commands[0];
	var entityValue = commands[1];
	var options = self.setURLOptions();
	options.url = self.grafanaUrl + self.createURL('show', entityType, entityValue);
	request.get(options, printResponse);
};

// Switches an org
Grafana.prototype.switch = function(commands) {
	var self = this;
	var entityType = commands[0];
	var entityValue = commands[1];
	var successMessage = 'Org switched to ' + entityValue + ' successfully.';
	var failureMessage = 'Org switch to ' + entityValue + ' failed.';
	if (entityType !== 'org') {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	var options = self.setURLOptions();
	options.url = self.grafanaUrl + self.createURL('switch', entityType, entityValue);
	request.post(options, function saveHandler(error, response, body) {
		if (error) {
			logger.showOutput(error);
			logger.showError(failureMessage);
		} else {
			if (body !== undefined) {
				logger.showOutput(logger.stringify(body));
			}
			if (response.statusCode === 200) {
				logger.showResult(successMessage);
			} else {
				logger.showError(failureMessage);
			}
		}
	});
};

// imports a dashboard or all dashboards from Grafana
Grafana.prototype.import = function(commands) {
	var self = this;
	var successMessage;
	var failureMessage;
	var entityType = commands[0];
	var entityValue = commands[1];
	var url;
	var output = '';
	// imports a dashboard from Grafana
	if (entityType === 'dashboard') {
		importSrv.dashboard(self.grafanaUrl, self.setURLOptions(), entityValue);
	}
	// import all dashboards from Grafana
	else if (entityType === 'dashboards') {
		importSrv.dashboards(self.grafanaUrl, self.setURLOptions());
	}
	// imports an org from Grafana
	else if (entityType === 'org') {
		importSrv.org(self.grafanaUrl, self.setURLOptions(), entityValue);
	}
	// imports all orgs from Grafana
	else if (entityType === 'orgs') {
		importSrv.orgs(self.grafanaUrl, self.setURLOptions());
	}
	// import a alert from Grafana
	else if (entityType === 'alert') {
		importSrv.alert(self.grafanaUrl, self.setURLOptions(), entityValue);
	}
	// import all alerts from Grafana
	else if (entityType === 'alerts') {
		importSrv.alerts(self.grafanaUrl, self.setURLOptions());
	}
	// import a datasource from Grafana
	else if (entityType === 'datasource') {
		importSrv.datasource(self.grafanaUrl, self.setURLOptions(), entityValue);
	}
	// import all datasources from Grafana
	else if (entityType === 'datasources') {
		importSrv.datasources(self.grafanaUrl, self.setURLOptions());
	} else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
};

// export a dashboard to Grafana
Grafana.prototype.export = function(commands) {
	var self = this;
	var successMessage;
	var failureMessage;
	var entityType = commands[0];
	var entityValue = commands[1];
	var url;
	var body;
	// exporting a dashboard to Grafana
	if (entityType === 'dashboard') {
		exportSrv.dashboard(self.grafanaUrl, self.setURLOptions(), entityValue);
	}
  // exporting all local dashbaords to Grafana
	else if (entityType === 'dashboards') {
		exportSrv.dashboards(self.grafanaUrl, self.setURLOptions());
	}
	// exporting a local org to Grafana
	else if (entityType === 'org') {
		exportSrv.org(self.grafanaUrl, self.setURLOptions(), entityValue);
	}
	// exporting a local org to Grafana
	else if (entityType === 'orgs') {
		exportSrv.orgs(self.grafanaUrl, self.setURLOptions());
	}
	// exporting a single local alert notification to Grafana
	else if (entityType === 'alert') {
		exportSrv.alert(self.grafanaUrl, self.setURLOptions(), entityValue);
	}
	// exporting all local alert notifications to Grafana
	else if (entityType === 'alerts') {
		exportSrv.alerts(self.grafanaUrl, self.setURLOptions());
	}
	// exporting a single local datasource to Grafana
	else if (entityType === 'datasource') {
		exportSrv.datasource(self.grafanaUrl, self.setURLOptions(), entityValue);
	}
	// exporting all local datasources to Grafana
	else if (entityType === 'datasources') {
		exportSrv.datasources(self.grafanaUrl, self.setURLOptions());
	}
	else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
};

// list all dashboards
Grafana.prototype.list = function(commands) {

	var self = this;
	var successMessage;
	var failureMessage;
	var entityType = commands[0];
	var url;
	var options = self.setURLOptions();
	if (entityType === 'dashboards') {
		successMessage = 'Displayed dashboards list successfully.';
		failureMessage = 'Dashboards list display failed';
		options.url = self.grafanaUrl + self.createURL('list', entityType);
		request.get(options, function saveHandler(error, response, body) {
			var output = '';
			if (!error && response.statusCode === 200) {
				var table = new Table({
	    			head: ['Title', 'Slug'],
	  				colWidths: [50, 50]
				});
				_.each(body, function(dashboard){
					table.push([dashboard.title, dashboard.uri.substring(3)]); //removing db/
				});
				output += table.toString();
	  	  		logger.showOutput(output);
	  	  		logger.showResult('Total dashboards: ' + body.length);
	    		logger.showResult(successMessage);
	  		} else {
	  			output += 'Grafana API response status code = ' + response.statusCode;
	  			if (error === null) {
	  				output += '\nNo error body from Grafana API.';
	  			}
	  			else {
	  				output += '\n' + error;
	  			}
	  			logger.showOutput(output);
	  			logger.showError(failureMessage);
	  		}
		});
	} else if (entityType === 'dash-tags') {
		successMessage = 'Displayed dashboard tags list successfully.';
		failureMessage = 'Dashboard tags list display failed';
		options.url = self.grafanaUrl + this.createURL('list', entityType);
		request.get(options, function saveHandler(error, response, body) {
			var output = '';
			if (!error && response.statusCode === 200) {
				var table = new Table({
	    		head: ['Tag', 'Count'],
	  			colWidths: [50, 50]
				});
				_.each(body, function(tag){
					table.push([tag.term, tag.count]);
				});
				output += table.toString();
	  	 		logger.showOutput(output);
	  	  		logger.showResult('Total dashboard tags: ' + body.length);
	    		logger.showResult(successMessage);
	  		} else {
		  		output += 'Grafana API response status code = ' + response.statusCode;
		  		if (error === null) {
		  			output += '\nNo error body from Grafana API.';
		  		}
		  		else {
		  			output += '\n' + error;
		  		}
		  		logger.showOutput(output);
		  		logger.showError(failureMessage);
	  		}
		});
	} else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}

};

// Creates a 8 second clip of a dashboard for last 24 hours
Grafana.prototype.clip = function(commands) {
	var self = this;
	if (!self.clipConfig || self.clipConfig.length < 6) {
		logger.showError('Clip configs not set. Please set all 6 clip config properties stated in README.');
		return;
	}
	var entityType = commands[0];
	var entityValue = commands[1];
	var url;
	localfs.createDirIfNotExists('temp', true);
	// creating a gif of a dashboard
	if (entityType === 'dashboard') {
		clipSrv.dashboard(self.grafanaUrl, self.setURLOptions(), entityValue);
	} else if (entityType === 'dashboards-by-tag') {
		clipSrv.dashboardByTag(self.grafanaUrl, self.setURLOptions(), entityValue);
	} else if (entityType === 'dash-list') {
		clipSrv.dashList(self.grafanaUrl, self.setURLOptions(), entityValue);
	} else {
		logger.showError('Unsupported set of commands ' + commands + '.');
	}
};

// Create url for calling Grafana API
Grafana.prototype.createURL = function(command, entityType, entityValue) {

	var url = '';

	// Editing URL depending on entityType
	if (entityType === 'org') {
		if (command === 'switch') {
			url += '/api/user/using/' + entityValue;
		} else {
			url += '/api/orgs';
			if (command === 'show' || command === 'delete' || command === 'import' || command === 'export') {
				url += '/' + entityValue;
			}
        }
	} else if (entityType === 'orgs') {
		url += '/api/orgs';
	} else if (entityType === 'dashboard') {
		if (command === 'clip') {
			url += '/render/dashboard/db/' + entityValue;
		} else {
			url += '/api/dashboards/db';
		}
		if (command === 'import' || command === 'delete' || command === 'show') {
			url += '/' + entityValue;
		}
	} else if (entityType === 'dashboards') {
		url += '/api/search';
	} else if (entityType === 'dashboards-by-tag') {
		url += '/api/search';
	} else if (entityType === 'dash-tags') {
		url += '/api/dashboards/tags';
	} else if (entityType === 'datasources') {
		url += '/api/datasources';
	} else if (entityType === 'datasource') {
		if (command === 'show' || command === 'import') {
			url += '/api/datasources/name/' + entityValue;
		} else if (command === 'export') {
			url += '/api/datasources/' + entityValue;
		}
	}
	return url;
};

// add options to request
Grafana.prototype.setURLOptions = function() {
	var self = this;
	var options = {};
	if (self.auth) {
		options.auth = self.auth;
	}
	if (self.headers) {
		options.headers = self.headers;
	}
	options.json = true;
	return options;
};

// prints HTTP response from Grafana
function printResponse(error, response, body) {
	var output = '';
	if (!error && response.statusCode === 200) {
  		output += logger.stringify(body);
  		logger.showOutput(output);
	} else {
  		output += 'Grafana API response status code = ' + response.statusCode;
  		if (error === null) {
  			output += '\nNo error body from Grafana API.';
  		}
  		else {
  			output += '\n' + error;
  		}
  		logger.showOutput(output);
  	}
}

module.exports = Grafana;
