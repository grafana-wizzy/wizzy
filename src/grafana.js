#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('./logger.js');
var logger = new Logger();

var _ = require('lodash');
var request = require('request');
var Table = require('cli-table');

var successMessage;
var failureMessage;

var components;

var grafana_url;
var auth = {};
var body = {};

function Grafana(conf, comps) {
	grafana_url = conf.url;
	auth.username = conf.username;
	auth.password = conf.password;
	if (conf.debug_api === true || conf.debug_api === 'true') {
		request.debug = true;
	} else {
		request.debug = false;
	}
	components = comps;
}

// creates an org
Grafana.prototype.create = function(commands) {

	var entityType = commands[0];
	var entityValue = commands[1];

	if (entityType === 'org') {
		body['name'] = entityValue;
		successMessage = 'Created Grafana org ' + entityValue + ' successfully.';
		failureMessage = 'Error in creating Grafana org ' + entityValue + '.';
	}
	else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	var url = grafana_url + this.createURL('create', entityType, entityValue);
	sendRequest('POST', url);
	
}

// deletes a dashboard or an org
Grafana.prototype.delete = function(commands) {

	var entityType = commands[0];
	var entityValue = commands[1];

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
	var url = grafana_url + this.createURL('delete', entityType, entityValue);
	sendRequest('DELETE', url);

}

// shows an org or orgs or a dashboard
Grafana.prototype.show = function(commands) {

	var entityType = commands[0];
	var entityValue = commands[1];

	var url = grafana_url + this.createURL('show', entityType, entityValue);
	if (entityType === 'orgs') {
		successMessage = 'Showed orgs successfully.';
		failureMessage = 'Error in showing orgs.';
	} else if (entityType === 'org') {
		successMessage = 'Showed org ' + entityValue + ' successfully.';
		failureMessage = 'Error in showing org ' + entityValue + '.';
	} else if (entityType === 'dashboard') {
		successMessage = 'Showed dashboard ' + entityValue + ' successfully.';
		failureMessage = 'Error in showing dashboard ' + entityValue + '.';
	}	else if (entityType === 'datasources') {
		successMessage = 'Showed datasources successfully.';
		failureMessage = 'Error in showing datasources.';
	} else if (entityType === 'datasource') {
		successMessage = 'Showed datasource ' + entityValue + ' successfully.';
		failureMessage = 'Error in showing datasource' + entityValue + '.';
	} else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	sendRequest('GET', url);

}

// imports a dashboard or all dashboards from Grafana
Grafana.prototype.import = function(commands) {

	var entityType = commands[0];
	var entityValue = commands[1];

	// imports a single dashboard
	if (entityType === 'dashboard') {
		successMessage = 'Dashboard '+ entityValue + ' import successful.';
		failureMessage = 'Dashboard '+ entityValue + ' import failed.';
		var url = grafana_url + this.createURL('import', entityType, entityValue);
		request.get({url: url, auth: auth, json: true}, function saveHandler(error, response, body) {
			var output = '';
			if (!error && response.statusCode == 200) {
	  	  output += body;
				components.saveDashboard(entityValue, body.dashboard, true);
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
	} // import all dashboards
	else if (entityType === 'dashboards') {
		successMessage = 'Dashboards imported successful.';
		failureMessage = 'Dashboards import failed.';
		var self = this;
		var url = grafana_url + self.createURL('list', entityType);
		request.get({url: url, auth: auth, json: true}, function saveHandler(error, response, body) {
			var dashList = [];
			if (!error && response.statusCode == 200) {
				_.each(body, function(dashboard){
					dashList.push(dashboard.uri.substring(3)); //removing db/
				});
	  	  _.each(dashList, function(dash){
	  	  	url = grafana_url + self.createURL('import', 'dashboard', dash);
	  	  	request.get({url: url, auth: auth, json: true}, function saveHandler(error, response, body) {
						if (!error && response.statusCode == 200) {
							components.saveDashboard(dash, body.dashboard, false);
				  	}
					});
	  	  });
	  	  logger.showResult('Total dashboards imported: ' + dashList.length);
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
	} else if (entityType === 'org') {
		successMessage = 'Org '+ entityValue + ' import successful.';
		failureMessage = 'Org '+ entityValue + ' import failed.';
		var url = grafana_url + this.createURL('import', entityType, entityValue);
		request.get({url: url, auth: auth, json: true}, function saveHandler(error, response, body) {
			var output = '';
			if (!error && response.statusCode == 200) {
	  	  output += body;
	  	  components.saveOrg(entityValue, body, true);
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
	} else if (entityType === 'orgs') {
		successMessage = 'Orgs import successful.';
		failureMessage = 'Orgs import failed.';
		var self = this;
		var url = grafana_url + self.createURL('import', entityType);
		request.get({url: url, auth: auth, json: true}, function saveHandler(error, response, body) {
			var orgList = [];
			if (!error && response.statusCode == 200) {
				_.each(body, function(org){
					orgList.push(org.id);
				});
				_.each(orgList, function(id) {
					url = grafana_url + self.createURL('import', 'org', id);
					request.get({url: url, auth: auth, json: true}, function saveHandler(error, response, body) {
						if (!error && response.statusCode == 200) {
							components.saveOrg(id, body, false);
				  	}
					});
				});
	  	  logger.showResult('Total orgs imported: ' + body.length);
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
	}  else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
}

// export a dashboard to Grafana
Grafana.prototype.export = function(commands) {

	var entityType = commands[0];
	var entityValue = commands[1];

	if (entityType === 'dashboard' || entityType === 'new-dashboard') {
		var dashBody = {
			dashboard: components.readDashboard(entityValue),
			overwrite: true
		}
		if (entityType === 'new-dashboard') {
			dashBody.dashboard.id = null;
		}
		successMessage = 'Dashboard '+ entityValue + ' export successful.';
		failureMessage = 'Dashboard '+ entityValue + ' export failed.';
		body = dashBody;
		var url = grafana_url + this.createURL('export', entityType, entityValue);
		sendRequest('POST', url);
	}  else if (entityType === 'org') {
		body = components.readOrg(entityValue);
		successMessage = 'Org '+ entityValue + ' export successful.';
		failureMessage = 'Org '+ entityValue + ' export failed.';
		var url = grafana_url + this.createURL('export', entityType, entityValue);
		console.log(url);
		console.log(body);
		sendRequest('PUT', url);
	} else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}

}

// list all dashboards
Grafana.prototype.list = function(commands) {

	var entityType = commands[0];

	if (entityType === 'dashboards') {
		successMessage = 'Displayed dashboards list successfully.';
		failureMessage = 'Dashboards list display failed';
	} else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
	var url = grafana_url + this.createURL('list', entityType);
	request.get({url: url, auth: auth, json: true}, function saveHandler(error, response, body) {
		var output = '';
		if (!error && response.statusCode == 200) {
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

}

// Create url for calling Grafana API
Grafana.prototype.createURL = function(command, entityType, entityValue) {

	var url = '';

	// Editing URL depending on entityType
	if (entityType === 'org') {
		url += '/api/orgs'
		if (command === 'show' || command === 'delete' || command === 'import' || command === 'export') {
			 url += '/' + entityValue;
		}
	} else if (entityType === 'orgs') {
		url += '/api/orgs';
	} else if (entityType === 'dashboard') {
		url += '/api/dashboards/db';
		if (command === 'import' || command === 'delete' || command === 'show') {
			url += '/' + entityValue;
		}
	} else if (entityType === 'new-dashboard') {
		url += '/api/dashboards/db';
	} else if (entityType === 'dashboards') {
		url += '/api/search';
	} else if (entityType === 'datasources') {
		url += '/api/datasources';
	} else if (entityType === 'datasource') {
		url += '/api/datasources/name/' + entityValue;
	}

	return url;

}

// Sends an HTTP API request to Grafana
function sendRequest(method, url) {
	
	if (method === 'POST') {
		request.post({url: url, auth: auth, json: true, body: body}, printResponse); 
	} else if (method === 'GET') {
		request.get({url: url, auth: auth, json: true, method: method}, printResponse);
	} else if (method === 'DELETE') {
		request.delete({url: url, auth: auth, json: true, method: method}, printResponse);
	} else if (method === 'PUT') {
		request.put({url: url, auth: auth, json: true, body: body}, printResponse);
	}
	
}

// prints HTTP response from Grafana
function printResponse(error, response, body) {
	var output = '';
		if (!error && response.statusCode == 200) {
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
}

module.exports = Grafana;