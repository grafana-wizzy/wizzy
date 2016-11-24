#!/usr/bin/env node
"use strict";

var expect = require('chai').expect;

var Grafana = require('../src/grafana.js');

var config = {
	url: 'http://localhost:3000',
	username: 'admin',
	password: 'password'
}

var grafana;

// Create a new Grafana object for each test
beforeEach(function() {
  grafana = new Grafana(config);
});

afterEach(function() {
  grafana = null;
})

describe('Check Grafana Configuration', function() {
	it('should return url, username and password properties.', function() {
		expect(grafana.url).to.equal('http://localhost:3000');
		expect(grafana.auth.user).to.equal('admin');
		expect(grafana.auth.pass).to.equal('password');
	});
});

describe('Building Grafana API URL for commands', function() {

  describe('create org org_name command', function() {
    it('should post org by org_name url', function() {
    	grafana.createURL('create', 'org', 'test_org');
      expect(grafana.url).to.equal('http://localhost:3000/api/orgs');
    });
  });

  describe('show orgs command', function() {
    it('should get orgs url', function() {
    	grafana.createURL('show', 'orgs');
      expect(grafana.url).to.equal('http://localhost:3000/api/orgs');
    });
  });

  describe('show org org_id command', function() {
    it('should get org by org_id url', function() {
    	grafana.createURL('show', 'org', 1);
      expect(grafana.url).to.equal('http://localhost:3000/api/orgs/1');
    });
  });

  describe('delete org org_id command', function() {
    it('should delete org by org_id url', function() {
    	grafana.createURL('delete', 'org', 1);
      expect(grafana.url).to.equal('http://localhost:3000/api/orgs/1');
    });
  });

  describe('import dashboard dashboard_slug command', function() {
    it('should create get dashboard by dashboard_slug url', function() {
    	grafana.createURL('import', 'dashboard', 'test-dashboard');
      expect(grafana.url).to.equal('http://localhost:3000/api/dashboards/db/test-dashboard');
    });
  });

  describe('export dashboard dashboard_slug command', function() {
    it('should create post dashboard url', function() {
    	grafana.createURL('export', 'dashboard', 'test-dashboard');
      expect(grafana.url).to.equal('http://localhost:3000/api/dashboards/db');
    });
  });

  describe('show dashboard dashboard_slug command', function() {
    it('should create get dashboard by dashboard_slug url', function() {
    	grafana.createURL('show', 'dashboard', 'test-dashboard');
      expect(grafana.url).to.equal('http://localhost:3000/api/dashboards/db/test-dashboard');
    });
  });

  describe('delete new-dashboard dashboard_slug command', function() {
    it('should create delete dashboard by dashboard_slug url', function() {
    	grafana.createURL('delete', 'dashboard', 'test-dashboard');
      expect(grafana.url).to.equal('http://localhost:3000/api/dashboards/db/test-dashboard');
    });
  });

  describe('export newdash dashboard_slug command', function() {
    it('should create post dashboard url', function() {
      grafana.createURL('export', 'newdash', 'test-new-dashboard');
      expect(grafana.url).to.equal('http://localhost:3000/api/dashboards/db');
    });
  });

  describe('show dasharch dashboard_slug command', function() {
    it('should create get dashboard json by dashboard_slug', function() {
      grafana.createURL('show', 'dasharch', 'test-dashboard');
      expect(grafana.url).to.equal('http://localhost:3000/api/dashboards/db/test-dashboard');
    });
  });

});