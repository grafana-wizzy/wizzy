#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('../util/logger.js');
var logger = new Logger();
var AWS = require('aws-sdk');
var _ = require('lodash');

var successMessage;
var failureMessage;

var components;
var body = {};
var s3 = new AWS.S3();
var params = {};


//Create the s3 bucket and required directories
function S3(conf, comps) {
	failureMessage = 'Connection to S3 failed.';
	AWS.config = new AWS.Config();
	AWS.config.accessKeyId = conf.access_key;
	AWS.config.secretAccessKey = conf.secret_key;
	AWS.config.region = conf.region;
	params.Bucket = conf.bucket_name
	if(conf.path)
		params.Key = conf.path;
	s3.headObject(params, function(err, data) {
  		if (err){
  			delete params.Key;
  			s3.createBucket(params, function(err_cb, data_cb) {
		  		if (!err_cb){
		  			  if(conf.path){ 
						s3.putObject({
			        	  	Bucket: conf.bucket_name,
			        		Key: conf.path,
			    			}, function (err_cb_key,res_cb_key) {
			    				if(err_cb_key){
									logger.showError('dnajsasjlasj');
									logger.showError('Cannot create directory '+conf.path+' in s3 bucket '+params.Bucket+'.');
			    				}
	         	  			});				
					  	}
					  	var directories = new Set();
					  	directories.add('dashboards');
					  	for(let dir of directories){
						  	var key = ''
							if(conf.path){
								key = conf.path+"/"+dir
							}
							else {
								key = dir
							}
							s3.putObject({
								Bucket: conf.bucket_name,
					    		Key: key,
								}, function (err,data) {
									if (err){
										logger.showError(failureMessage);
										logger.showError('Cannot create directory '+dir+'.');
							  		}
						  		});	
						 }
				}         
			});	
		}
	});
	components = comps;
}

S3.prototype.upload = function(commands){
	successMessage = 'Dashboard '+ entityValue + ' upload successful.';
	failureMessage = 'Dashboard '+ entityValue + ' upload failed.';
	var entityType = commands[0];
	var entityValue = commands[1];
	if (entityType === 'dashboard') {
		successMessage = 'Uploaded dashboard ' + entityValue + ' successfully.';
		failureMessage = 'Error in uploading dashboard ' + entityValue + '.';
		var dashboard_data = components.readDashboard(entityValue)
	  	var key = ''
	  	if(params.Key){
	  		key = params.Key + '/dashboards/'+entityValue+'.json'
	  	}
	  	else{
	  		key = 'dashboards/'+entityValue+'.json'	
	  	}
	  	s3.putObject({
	    	Bucket: params.Bucket,
	    	Key: key,
	    	Body: JSON.stringify(dashboard_data)
	  	}, function (err,data) {
			if (err){
				logger.showError(failureMessage);
				logger.showError('Dashboard '+entityValue+' cannot be stored in location s3://'+params.Bucket+"/"+key+'.');
			}
			else{
				logger.showResult(successMessage);
			}
		 });
	}
	else if (entityType === 'dashboards') {
		successMessage = 'Dashboards uploaded successfully.';
		var dashboards = components.readEntityNamesFromDir('dashboards');
		_.forEach(dashboards,function(dashboard){
			var dashboard_data = components.readDashboard(dashboard)
	  		var key = ''
		  	if(params.Key){
		  		key = params.Key + '/dashboards/'+dashboard+'.json'
		  	}
		  	else{
		  		key = 'dashboards/'+dashboard+'.json'	
		  	}
		  	s3.putObject({
		    	Bucket: params.Bucket,
		    	Key: key,
		    	Body: JSON.stringify(dashboard_data)
		  	}, function (err,data) {
				if (err){
					console.log(err)
					logger.showError('Dashboard '+entityValue+' cannot be stored in location s3://'+params.Bucket+"/"+key+'.');
				}
			 });
		});
		logger.showResult(successMessage);
	}
	else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}	
}

S3.prototype.download = function(commands){
	var entityType = commands[0];
	var entityValue = commands[1];
	if (entityType === 'dashboard') {
		successMessage = 'Downloaded dashboard ' + entityValue + ' successfully.';
		failureMessage = 'Error in downloading dashboard ' + entityValue + '.';	
	  	var key = ''
	  	if(params.Key){
	  		key = params.Key + '/dashboards/'+entityValue+'.json'
	  	}
	  	else{
	  		key = 'dashboards/'+entityValue+'.json'	
	  	}
	  	s3.getObject({
	    	Bucket: params.Bucket,
	    	Key: key,
	  	}, function (err,data) {
			if (err){
				logger.showError(failureMessage);
				logger.showError('Dashboard '+entityValue+' not present in location s3://'+params.Bucket+"/"+key+'.');
			}
			else{
				components.saveDashboard(entityValue, JSON.parse(data.Body.toString()), true);
				logger.showResult(successMessage);
			}
		 });
	}
	else if (entityType === 'dashboards') {

		successMessage = 'Dashboards downloaded successfully.';
		var dashboards = components.readEntityNamesFromDir('dashboards');
			var bucket_key = ''
			if(params.Key){
	  			bucket_key = params.Key + '/dashboards/'
	  		}
	  		else{
	  			bucket_key = 'dashboards/'	
	  		}
	  		delete params.Key
	  		s3.listObjects(params, function(err, data) {
  				if (err) { 
    				console.log(err);
    				return;
  				}
  				else{
  					var dashboards = data.Contents;
  					_.forEach(dashboards,function(dashboard){
						if(dashboard.Key.indexOf(bucket_key) > -1){
							var key = dashboard.Key
					  		s3.getObject({
					    		Bucket: params.Bucket,
					    		Key: key,
					  		}, function (err,data) {
								if (err){
									logger.showError('Dashboard '+dashboard.Key.split('/')[dashboard.Key.split('/').length - 1].split('.')[0]+' not present in location s3://'+params.Bucket+"/"+key+'.');
								}
								else{
									components.saveDashboard(dashboard.Key.split('/')[dashboard.Key.split('/').length - 1].split('.')[0], JSON.parse(data.Body.toString()), false);
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
}

module.exports = S3;
