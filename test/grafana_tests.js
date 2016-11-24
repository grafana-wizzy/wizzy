#!/usr/bin/env node
"use strict";

var Grafana = require('../src/grafana.js');
var assert = require('assert');

var config = {
	url: 'http://localhost:3000',
	username: 'admin',
	password: 'password'
}

describe('Check Grafana Configuration', function() {
	it('should return url, username and password properties.', function() {
		var grafana = new Grafana(config);
		assert.equal(grafana.url, 'http://localhost:3000');
		assert.equal(grafana.auth.user, 'admin');
		assert.equal(grafana.auth.pass, 'password');
	});
});

describe('Building Grafana API URL for org commands', function() {
  
  describe('create org org_name command', function() {
    it('should create org by org_name url', function() {
    	var grafana = new Grafana(config);
    	grafana.createURL('create', 'org', 'test_org');
      assert.equal(grafana.url, 'http://localhost:3000/api/orgs');
    });
  });

  describe('show orgs command', function() {
    it('should create show orgs url', function() {
    	var grafana = new Grafana(config);
    	grafana.createURL('create', 'org', 'test_org');
      assert.equal(grafana.url, 'http://localhost:3000/api/orgs');
    });
  });

  describe('show org org_id command', function() {
    it('should create show org by org_id url', function() {
    	var grafana = new Grafana(config);
    	grafana.createURL('show', 'org', 1);
      assert.equal(grafana.url, 'http://localhost:3000/api/orgs/1');
    });
  });

  describe('delete org org_id command', function() {
    it('should delete show org by org_id url', function() {
    	var grafana = new Grafana(config);
    	grafana.createURL('delete', 'org', 1);
      assert.equal(grafana.url, 'http://localhost:3000/api/orgs/1');
    });
  });

});

describe('Building Grafana API URL for dashboard commands', function() {
  
  describe('import dashboard dashboard_slug command', function() {
    it('should create import dashboard by dashboard_slug url', function() {
    	var grafana = new Grafana(config);
    	grafana.createURL('import', 'dashboard', 'test-dashboard');
      assert.equal(grafana.url, 'http://localhost:3000/api/dashboards/db/test-dashboard');
    });
  });

  describe('export dashboard dashboard_slug command', function() {
    it('should create export dashboard url', function() {
    	var grafana = new Grafana(config);
    	grafana.createURL('export', 'dashboard', 'test-dashboard');
      assert.equal(grafana.url, 'http://localhost:3000/api/dashboards/db');
    });
  });

  describe('export new-dashboard dashboard_slug command', function() {
    it('should create export dashboard url', function() {
    	var grafana = new Grafana(config);
    	grafana.createURL('export', 'new-dashboard', 'test-new-dashboard');
      assert.equal(grafana.url, 'http://localhost:3000/api/dashboards/db');
    });
  });

  describe('show dashboard dashboard_slug command', function() {
    it('should create show dashboard by dashboard_slug url', function() {
    	var grafana = new Grafana(config);
    	grafana.createURL('show', 'dashboard', 'test-dashboard');
      assert.equal(grafana.url, 'http://localhost:3000/api/dashboards/db/test-dashboard');
    });
  });

  describe('delete new-dashboard dashboard_slug command', function() {
    it('should create delete dashboard by dashboard_slug url', function() {
    	var grafana = new Grafana(config);
    	grafana.createURL('delete', 'dashboard', 'test-dashboard');
      assert.equal(grafana.url, 'http://localhost:3000/api/dashboards/db/test-dashboard');
    });
  });

});