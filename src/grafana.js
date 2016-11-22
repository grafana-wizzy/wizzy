#!/usr/bin/env node
"use strict";

var request = require('request');

function Grafana(config) {
	this.url = config.url;
	this.auth = {
		'user': config.username,
		'pass': config.password
	};
	this.body = {};
}

Grafana.prototype.create = function(entity_type, entity_value) {
	
	switch(entity_type) {
		case 'org': 
			this.url += '/api/orgs';
			this.body['name'] = entity_value;
			break;
	}

	console.log(this.url);
	console.log(this.auth);
	console.log(this.body);

	request.post(this.url, {auth: this.auth, body: this.body, json: true}, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
	    } else {
      	console.error(error);
      }
    }
	);
}

Grafana.prototype.use = function(type, value) {
	console.log('use' + type);
	console.log('use' + value);
}

module.exports = Grafana;