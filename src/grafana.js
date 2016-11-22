#!/usr/bin/env node
"use strict";

var Logger = require('./logger.js');
var request = require('request');

function Grafana(config) {
	this.url = config.url;
	this.auth = {
		'user': config.username,
		'pass': config.password
	};
	this.body = {};
	this.logger = new Logger();
}

Grafana.prototype.create = function(entity_type, entity_value) {
	
	switch(entity_type) {
		case 'org': 
			this.url += '/api/orgs';
			this.body['name'] = entity_value;
			break;
	};

	request.post(this.url, {auth: this.auth, body: this.body, json: true}, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
	    } else {
      	console.error(error);
      }
    }
	);
}

module.exports = Grafana;