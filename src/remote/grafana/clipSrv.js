#!/usr/bin/env node
"use strict";

var request = require('request');
var Logger = require('../../util/logger.js');
var logger = new Logger('exportSrv');
var _ = require('lodash');
var syncReq = require('sync-request');
var components;
var LocalFS = require('../../util/localfs.js');
var localfs = new LocalFS();
var DashList = require('../../local/dashlist.js');
var GIFEncoder = require('gifencoder');
var encoder;
var pngFileStream = require('png-file-stream');

var clipConfig;

function ClipSrv(config) {
	clipConfig = config;
}

ClipSrv.prototype.dashboard = function(grafanaURL, options, dashboardName) {
	var url = createURL(grafanaURL, 'render-dashboard', dashboardName);
	url += '?width=' + clipConfig.render_width + '&height=' + clipConfig.render_height + '&timeout=' + clipConfig.render_timeout;
	var now = (new Date()).getTime();
	// Taking 24 screenshots for last 24 hours
	logger.justShow('Taking 24 snapshots.');
	var i = 0;
	while(i < 24) {
		var from = now - ((i + 1) * 60 * 60000);
		var to = now - (i * 60 * 60000);
		var completeUrl = url + '&from=' + from + '&to=' + to;
		completeUrl = sanitizeUrl(completeUrl, options.auth);
		var response = syncReq('GET', completeUrl, { headers: options.headers });
		if (response.statusCode === 200) {
			var filename = 'temp/' + String.fromCharCode(120 - i) + '.png';
			localfs.writeFile(filename, response.getBody());
			logger.showResult('Took snapshot ' + (i+1) + '.');
		} else {
			logger.showError('Snapshot ' + (i+1) + ' failed. Please increase timeout.');
		}
		i++;
	}
	logger.showResult('Snapshots rendering completed.');
	logger.justShow('Waiting 5 seconds before generating clip.');
	interval(function() {
		createGif(dashboardName);
	}, 5000, 1);
};

ClipSrv.prototype.dashboardByTag = function(grafanaURL, options, tagName) {
	var url = createURL(grafanaURL, 'search-dashboard') + '?tag=' + tagName;
	url = sanitizeUrl(url, options.auth);
	var searchResponse = syncReq('GET', url, { headers: options.headers });
	var responseBody = JSON.parse(searchResponse.getBody('utf8'));
	if (searchResponse.statusCode === 200 && responseBody.length > 0) {
		logger.showOutput('Taking dashboard snapshots.');
		var dashboards = _.each(responseBody, function (dashboard) {
			var dashName = dashboard.uri.substring(3);
			var dashUrl = createURL(grafanaURL, 'render-dashboard', dashName);
			dashUrl += '?width=' + clipConfig.render_width + '&height=' + clipConfig.render_height + '&timeout=' + clipConfig.render_timeout;
			dashUrl = sanitizeUrl(dashUrl, options.auth);
			var response = syncReq('GET', dashUrl, { headers: options.headers });
			if (response.statusCode === 200) {
				var filename = 'temp/' + dashName + '.png';
				localfs.writeFile(filename, response.getBody());
				logger.showResult('Took snapshot of ' + dashName + ' dashbaord.');
			} else {
				logger.showError('Snapshot of ' + dashName + ' dashbaord failed. Please increase timeout.');
			}
		});
	} else {
		logger.showError('No content available to make clip.');
	}
	logger.showResult('Snapshots rendering completed.');
	logger.justShow('Waiting 5 seconds before generating clip.');
	interval(function() {
		createGif(tagName);
	}, 5000, 1);
};

ClipSrv.prototype.dashList = function(grafanaURL, options, listName) {
	var dashList = new DashList();
	var list = dashList.getList(listName);
	if (list.length < 1) {
		logger.showOutput('No dashboard found in dashboard list ' + listName);
	} else {
		_.each(list, function(dashName) {
			var dashUrl = createURL(grafanaURL, 'render-dashboard', dashName);
			dashUrl += '?width=' + clipConfig.render_width + '&height=' + clipConfig.render_height + '&timeout=' + clipConfig.render_timeout;
			dashUrl = sanitizeUrl(dashUrl, options.auth);
			var response = syncReq('GET', dashUrl, { headers: options.headers });
			if (response.statusCode === 200) {
				var filename = 'temp/' + dashName + '.png';
				localfs.writeFile(filename, response.getBody());
				logger.showResult('Took snapshot of ' + dashName + ' dashbaord.');
			} else {
				logger.showError('Snapshot of ' + dashName + ' dashbaord failed. Please increase timeout.');
			}
		});
	}
	logger.showResult('Snapshots rendering completed.');
	logger.justShow('Waiting 5 seconds before generating clip.');
	interval(function() {
		createGif(listName);
	}, 5000, 1);
};

function createGif(clipName) {
	localfs.createDirIfNotExists('clips', false);
	encoder = new GIFEncoder(clipConfig.canvas_width, clipConfig.canvas_height);
	pngFileStream('temp/*.png')
		.pipe(encoder.createWriteStream({ repeat: -1, delay: parseInt(clipConfig.delay), quality: 40 }))
 		.pipe(localfs.writeStream('clips/' + clipName + '.gif'));
 	logger.showResult('Successfully created ' + clipName + ' clip under clips directory.');
 	logger.justShow('Please delete temp directory before creating next clip.');
}

function createURL(grafanaURL, entityType, entityValue) {
	if (entityType === 'render-dashboard') {
		grafanaURL += '/render/dashboard/db/' + entityValue;
	} else if (entityType === 'search-dashboard') {
		grafanaURL += '/api/search';
	}
	return grafanaURL;
}

// add auth to sync request
function sanitizeUrl(url, auth) {
	if (auth && auth.username && auth.password) {
		var urlParts = url.split('://');
		return urlParts[0] + '://' + auth.username + ':' + auth.password + '@' + urlParts[1];
	} else {
		return url;
	}
}

// interval function for delay
function interval(func, wait, times){
    var interv = function(w, t){
        return function(){
            if(typeof t === "undefined" || t-- > 0){
                setTimeout(interv, w);
                try{
                    func.call(null);
                }
                catch(e){
                    t = 0;
                    throw e.toString();
                }
            }
        };
    }(wait, times);
    setTimeout(interv, wait);
}

module.exports = ClipSrv;
