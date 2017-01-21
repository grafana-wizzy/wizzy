#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('../util/logger.js');
var logger = new Logger('Grafana.net');

var _ = require('lodash');
var request = require('request');
var Table = require('cli-table');

var gnet_dashboards_url = 'https://grafana.net/api/dashboards';

var datasourceMap = {

	promethues: 'prometheus',
	graphite: 'graphite',
	elasticsearch: 'elasticsearch',
	influxdb: 'influxdb',
	cloudwatch: 'cloudwatch',
	zabbix: 'alexanderzobnin-zabbix-datasource',
	opentsdb: 'opentsdb',
	grafana: 'grafana',
	mixed: 'mixed',
	opennms: 'opennms-datasource'

};

function GNet(comps) {
	this.components = comps;
}

// searches Grafana.net dashboards for dashboard list
GNet.prototype.list = function(commands) {
	
	var self = this;

	if (commands[0] === 'dashboards') {
		var successMessage = "Successfully searched Grafana.net.";
		var failureMessage = "Searching Grafana.net failed.";
		gnet_dashboards_url += '?orderBy=name';
		if (commands.length === 2) {
			var filter = commands[1].split('=');
			if (filter[0] === 'ds') {
				gnet_dashboards_url += '&dataSourceSlugIn=' + datasourceMap[filter[1].toLowerCase()];
			}
		}
		request.get({url: gnet_dashboards_url, json: true}, function saveHandler(error, response, body) {
			var output = '';
			if (!error && response.statusCode === 200) {
				var table = new Table({
	    		head: ['Id', 'Title', 'Datasource', 'Downloads', 'Revision'],
	  			colWidths: [10, 50, 20, 20, 10]
				});
				_.each(body.items, function(dashboard){
					table.push([dashboard.id, dashboard.name, dashboard.datasource, dashboard.downloads, dashboard.revision]); //removing db/
				});
				output += table.toString();
	  	 	logger.showOutput(output);
	  	  	logger.showResult('Total dashboards: ' + body.items.length);
	    	logger.showResult(successMessage);
	  	} else {
	  		output += 'Grafana API response status code = ' + response.statusCode;
	  		if (error === null) {
	  			output += '\nNo error body from Grafana.net API.';	
	  		}
	  		else {
	  			output += '\n' + error;
	  		}
	  		logger.showOutput(output);
	  		logger.showError(failureMessage);
	  	}
		});
	}
};

// searches Grafana.net dashboards for dashboard list
GNet.prototype.download = function(commands) {
	var self = this;
	if (commands[0] === 'dashboard') {
		var successMessage = "Successfully downloaded Grafana.net dashboard.";
		var failureMessage = "Grafana.net dashboard download failed.";
		var dashId = parseInt(commands[1]);
		var revisionId = parseInt(commands[2]);
		var dashboardUrl = gnet_dashboards_url + '/' + dashId + '/revisions/' + revisionId + '/download';
		request.get({url: dashboardUrl, json: true}, function saveHandler(error, response, body) {
			var output = '';
			if (!error && response.statusCode === 200) {
				self.components.dashboards.saveDashboard(convertName2Slug(body.title), body, true);
	    		logger.showResult(successMessage);
		  	} else {
	  			output += 'Unable to get dashboard ' + dashId + ' with ' + revisionId + ' from Grafana.net.';
				logger.showOutput(output);
				logger.showError(failureMessage);
			}
		});
	}
};

function convertName2Slug(name) {
	return name.toLowerCase().replace(/ /g,'-').replace(/[^a-zA-Z0-9-]/g, '');
}

module.exports = GNet;