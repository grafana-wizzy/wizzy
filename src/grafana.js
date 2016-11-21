#!/usr/bin/env node
"use strict";

var request = require('request');

function Grafana(url) {
	this.url = url;
}

Grafana.prototype.create = function(type, value) {
	console.log(type);
	console.log(value);
}

Grafana.prototype.createOrg = function(org_name) {
	var postOptions = {
		name: org_name
	}
	request.post(
    this.url, postOptions,
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        } else {
        	console.log(response.statusCode);
        }
    }
	);
}

module.exports = Grafana;