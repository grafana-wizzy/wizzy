#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('../util/logger.js');
var logger = new Logger();
var AWS = require('aws-sdk');
var _ = require('lodash');

//Create the s3 bucket and required directories
function S3(conf, comps) {
	this.params = {};
	if (conf && conf.s3 && conf.s3.bucket_name) {
		this.params.Bucket = conf.s3.bucket_name;
	}
	if (conf && conf.s3 && conf.s3.path) {
		this.params.Key = conf.s3.path;
	}
	this.components = comps;
	this.s3 = new AWS.S3({params: {Bucket: this.params.Bucket}});
}

S3.prototype.upload = function(commands) {

	var self = this;
	var entityType = commands[0];
	var entityValue = commands[1];
	var successMessage;
	var failureMessage;

	if (entityType === 'dashboard') {
		successMessage = 'Dashboard '+ entityValue + ' upload successful to AWS S3.';
		failureMessage = 'Dashboard '+ entityValue + ' upload failed to AWS S3.';
		var dashboard_data = self.components.dashboards.readDashboard(entityValue);
	  	var key = '';
	  	if(self.params.Key){
	  		key = self.params.Key + 'dashboards/' + entityValue + '.json';
	  	}
	  	else{
	  		key = 'dashboards/' + entityValue + '.json';
	  	}
	  	self.s3.putObject({
	    	Key: key,
	    	Body: JSON.stringify(dashboard_data)
	  	}, function (err,data) {
			if (err){
				logger.showError(failureMessage);
				logger.showError('Dashboard ' + entityValue + ' cannot be stored in location s3://' + self.params.Bucket + "/" + key + '.');
			}
			else{
				logger.showResult(successMessage);
			}
		 });
	}
	else if (entityType === 'dashboards') {
		successMessage = 'Dashboards are being uploaded. Command will exit once all dashboards are uploaded.';
		var dashboards = self.components.readEntityNamesFromDir('dashboards');
		_.forEach(dashboards,function(dashboard){
			var dashboard_data = self.components.dashboards.readDashboard(dashboard);
	  	var key = '';
		  	if(self.params.Key){
		  		key = self.params.Key + 'dashboards/' + dashboard + '.json';
		  	}
		  	else{
		  		key = 'dashboards/'+ dashboard + '.json';
		  	}
		  	self.s3.putObject({
		    	Key: key,
		    	Body: JSON.stringify(dashboard_data)
		  	}, function (err,data) {
				if (err){
					logger.showError(err);
					logger.showError('Dashboard ' + entityValue + ' cannot be stored in location s3://' + self.params.Bucket + '/' + key + '.');
				}
			 });
		});
		logger.showResult(successMessage);
	}
	else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}	
};

S3.prototype.download = function(commands){
	var self = this;
	var entityType = commands[0];
	var entityValue = commands[1];
	var successMessage;
	var failureMessage;

	if (entityType === 'dashboard') {
		successMessage = 'Downloaded dashboard ' + entityValue + ' successfully.';
		failureMessage = 'Error in downloading dashboard ' + entityValue + '.';	
	  var key = '';
	  	if(self.params.Key){
	  		key = self.params.Key + 'dashboards/'+entityValue+'.json';
	  	}
	  	else{
	  		key = 'dashboards/'+entityValue+'.json';
	  	}
	  	self.s3.getObject({
	    	Key: key,
	  	}, function (err,data) {
			if (err){
				logger.showError(failureMessage);
				logger.showError('Dashboard '+entityValue+' not present in location s3://'+self.params.Bucket+"/"+key+'.');
			}
			else{
				self.components.dashboards.saveDashboard(entityValue, JSON.parse(data.Body.toString()), true);
				logger.showResult(successMessage);
			}
		 });
	}
	else if (entityType === 'dashboards') {

		successMessage = 'Dashboards are being downloaded. Command will exit once all dashboards are downloaded.';
		var dashboards = self.components.readEntityNamesFromDir('dashboards');
		var bucket_key = '';
			if(self.params.Key){
	  			bucket_key = self.params.Key + 'dashboards/';
	  		}
	  		else{
	  			bucket_key = 'dashboards/';
	  		}
	  		delete self.params.Key;
	  		self.s3.listObjects(self.params, function(err, data) {
  				if (err) { 
    				console.log(err);
    				return;
  				}
  				else{
  					var dashboards = data.Contents;
  					_.forEach(dashboards,function(dashboard){
						if(dashboard.Key.indexOf(bucket_key) > -1){
							var key = dashboard.Key;
					  		self.s3.getObject({
					    		Bucket: self.params.Bucket,
					    		Key: key,
					  		}, function (err,data) {
								if (err){
									logger.showError('Dashboard '+dashboard.Key.split('/')[dashboard.Key.split('/').length - 1].split('.')[0]+' not present in location s3://'+ self.params.Bucket+"/"+key+'.');
								}
								else{
									self.components.dashboards.saveDashboard(dashboard.Key.split('/')[dashboard.Key.split('/').length - 1].split('.')[0], JSON.parse(data.Body.toString()), false);
								}
						 	});
					  	}
					});
					logger.showResult(successMessage);
  				}
		});
	}
	else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}	
};

module.exports = S3;
