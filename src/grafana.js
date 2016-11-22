#!/usr/bin/env node
"use strict";

var Logger = require('./logger.js');
var dashDir = 'dashboards';
var request = require('request');
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
			logger.showError('Unable to import dashboard from Grafana.')
		}
	});
}

function printResponse(error, response, body) {
	if (!error && response.statusCode == 200) {
      console.log(body)
    } else {
    	console.error(error);
    }
}

function saveDashboard(slug, dashboard) {
	var dashFile = dashDir + '/' + slug + '.json';
	fs.writeFileSync(dashFile, JSON.stringify(dashboard, null, 2));
	logger.showResult(slug + ' dashboard imported successfully, please check dashboards directory.');
}

module.exports = Grafana;