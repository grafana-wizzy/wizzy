#!/usr/bin/env node
"use strict";

var Logger = require('./logger.js');
var dashDir = 'dashboards';
var request = require('request');
request.debug = true;
var fs = require('fs');
var logger = new Logger();

function Grafana(config) {
	this.url = config.url;
	this.auth = {
		'user': config.username,
		'pass': config.password
	};
	this.body = {};
}

Grafana.prototype.create = function(entityType, entityValue) {
	
	switch(entityType) {
		case 'org': 
			this.url += '/api/orgs';
			this.body['name'] = entityValue;
			break;
	};

	request.post(this.url, {auth: this.auth, body: this.body, json: true}, printResponse);
}

Grafana.prototype.import = function(entityType, entityValue) {

	switch(entityType) {
		case 'dashboard': 
			this.url += '/api/dashboards/db/' + entityValue;
			break;
	};

	request.get({url: this.url, auth: this.auth, json: true}, function(error, response, body){
		if (!error && response.statusCode == 200) {
			saveDashboard(entityValue, body.dashboard);
		} else {
			if (!error) {
				console.error(error);
			} else if (response.statusCode != 200) {
				console.error(body);
			}
			logger.showError('Unable to import dashboard from Grafana.');
		}
	});
}

Grafana.prototype.export = function(entityType, entityValue) {

	switch(entityType) {
		case 'dashboard': 
			this.url += '/api/dashboards/db/';
			break;
	};

	var dashBody = {
		dashboard: readDashboard(entityValue),
		overwrite: true
	}

	request.post({url: this.url, auth: this.auth, body: dashBody, json: true}, function(error, response, body){
		if (!error && response.statusCode == 200) {
			logger.showResult('Successfully exported dashboard to Grafana.');
		} else {
			if (!error) {
				console.error(error);
			} else if (response.statusCode != 200) {
				console.error(body);
			}
			logger.showError('Unable to export dashboard to Grafana.');
		}
	});
}

// prints error or response from an http request
function printResponse(error, response, body) {
	if (!error && response.statusCode == 200) {
      console.log(body)
    } else {
    	console.error(error);
    }
}

// Saves a dashboard json in a file.
function saveDashboard(slug, dashboard) {
	var dashFile = dashDir + '/' + slug + '.json';
	fs.writeFileSync(dashFile, JSON.stringify(dashboard, null, 2));
	logger.showResult(slug + ' dashboard imported successfully, please check dashboards directory.');
}

// Reads dashboard json from file.
function readDashboard(slug) {
	var dashFile = dashDir + '/' + slug + '.json';
	var dashboard = JSON.parse(fs.readFileSync(dashFile, 'utf8', function (error, data) {
		if (!error) {
			logger.showResult('Verified file ' + slug + ' as a valid JSON.');
		}
		else {
			logger.showError(slug + '.json file is not a valid JSON.');
			process.exit();
		}
	}));
	return dashboard;
}

module.exports = Grafana;