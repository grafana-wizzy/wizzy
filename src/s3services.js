#!/usr/bin/env node
"use strict";

// Initializing logger
var Logger = require('./logger.js');
var logger = new Logger();
var AWS = require('aws-sdk');

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
		params.Key = conf.path
	s3.headObject(params, function(err, data) {
  		if (err){
  			s3.createBucket(params, function(err_cb, data) {
		  		if (!err){
		  			  if(conf.path){ 
						s3.putObject({
			        	  	Bucket: conf.bucket_name,
			        		Key: conf.path,
			    			}, function (err,res) {
			    				if(err){
									logger.showError(failureMessage);
									logger.showError('Cannot create directory '+conf.path+' in s3 bucket '+params.Bucket+'.');
			    				}
	         	  			});				
					  }
		  		}
		  	});
  		}          
	});

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
	}
	else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
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
		}
		else{
			logger.showError('Dashboard '+entityValue+' cannot be stored in location s3://'+params.Bucket+"/"+key+'.');
			logger.showResult(successMessage);
		}
	 });	
}

S3.prototype.download = function(commands){
	successMessage = 'Dashboard '+ entityValue + ' download successful.';
	failureMessage = 'Dashboard '+ entityValue + ' download failed.';
	var entityType = commands[0];
	var entityValue = commands[1];
	if (entityType === 'dashboard') {
		successMessage = 'Downloaded dashboard ' + entityValue + ' successfully.';
		failureMessage = 'Error in downloading dashboard ' + entityValue + '.';
	}
	else {
		logger.showError('Unsupported entity type ' + entityType);
		return;
	}
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

module.exports = S3;
