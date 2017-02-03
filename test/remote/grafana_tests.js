#!/usr/bin/env node
"use strict";

var expect = require('chai').expect;

var Grafana = require('../../src/remote/grafana.js');

var config = {
  grafana: {
    url: 'http://localhost:3000',
    username: 'admin',
    password: 'password'
  }
}

var components = {};

var grafana;

// Create a new Grafana object for each test
beforeEach(function() {
  grafana = new Grafana(config, components);
});

afterEach(function() {
  grafana = null;
})

describe('Check Grafana URLs', function() {

  describe('create URL for listing all dashboards', function() {
    it('should return URL /api/search .', function() {
      var url = grafana.createURL('list', 'dashboards');
      expect(url).to.equal('/api/search');
    });
  });

  describe('create URL for showing a dashboard', function() {
    it('should return URL /api/dashboards/db/:slug .', function() {
      var url = grafana.createURL('show', 'dashboard', 'test-dash');
      expect(url).to.equal('/api/dashboards/db/test-dash');
    });
  });

  describe('create URL for importing a dashboard', function() {
    it('should return URL /api/dashboards/db/:slug .', function() {
      var url = grafana.createURL('import', 'dashboard', 'test-dash');
      expect(url).to.equal('/api/dashboards/db/test-dash');
    });
  });

  describe('create URL for exporting a dashboard', function() {
    it('should return URL /api/dashboards/db .', function() {
      var url = grafana.createURL('export', 'dashboard', 'test-dash');
      expect(url).to.equal('/api/dashboards/db');
    });
  });

  describe('create URL for deleting a dashboard', function() {
    it('should return URL /api/dashboards/db .', function() {
      var url = grafana.createURL('delete', 'dashboard', 'test-dash');
      expect(url).to.equal('/api/dashboards/db/test-dash');
    });
  });

  describe('create URL for showing all orgs', function() {
    it('should return URL /api/orgs .', function() {
      var url = grafana.createURL('show', 'orgs');
      expect(url).to.equal('/api/orgs');
    });
  });

  describe('create URL for showing an org', function() {
    it('should return URL /api/orgs/:orgId .', function() {
      var url = grafana.createURL('show', 'org', 12);
      expect(url).to.equal('/api/orgs/12');
    });
  });

  describe('create URL for creating an org', function() {
    it('should return URL /api/orgs .', function() {
      var url = grafana.createURL('create', 'org', 'test-org');
      expect(url).to.equal('/api/orgs');
    });
  });

  describe('create URL for deleting an org', function() {
    it('should return URL /api/org .', function() {
      var url = grafana.createURL('delete', 'org', 12);
      expect(url).to.equal('/api/orgs/12');
    });
  });

  describe('create URL for importing all orgs', function() {
    it('should return URL /api/orgs .', function() {
      var url = grafana.createURL('import', 'orgs');
      expect(url).to.equal('/api/orgs');
    });
  });

  describe('create URL for importing an org', function() {
    it('should return URL /api/orgs/:orgId .', function() {
      var url = grafana.createURL('import', 'org', 12);
      expect(url).to.equal('/api/orgs/12');
    });
  });

  describe('create URL for exporting an org', function() {
    it('should return URL /api/orgs/:orgId .', function() {
      var url = grafana.createURL('export', 'org', 12);
      expect(url).to.equal('/api/orgs/12');
    });
  });

  describe('create URL for showing all datasources', function() {
    it('should return URL /api/datasources .', function() {
      var url = grafana.createURL('show', 'datasources');
      expect(url).to.equal('/api/datasources');
    });
  });

  describe('create URL for showing a datasource', function() {
    it('should return URL /api/datasources/:datasourceId .', function() {
      var url = grafana.createURL('show', 'datasource', 1);
      expect(url).to.equal('/api/datasources/name/1');
    });
  });

  describe('create URL for importing all datasources', function() {
    it('should return URL /api/datasources .', function() {
      var url = grafana.createURL('import', 'datasources');
      expect(url).to.equal('/api/datasources');
    });
  });

  describe('create URL for importing a datasource', function() {
    it('should return URL /api/datasources/:datasourceId .', function() {
      var url = grafana.createURL('import', 'datasource', 1);
      expect(url).to.equal('/api/datasources/name/1');
    });
  });

  describe('create URL for exporting a datasource', function() {
    it('should return URL /api/datasources/:datasourceId .', function() {
      var url = grafana.createURL('export', 'datasource', 1);
      expect(url).to.equal('/api/datasources/1');
    });
  });

  describe('create URL for switching an org', function() {
    it('should return URL /api/user/using/:orgId .', function() {
      var url = grafana.createURL('switch', 'org', 2);
      expect(url).to.equal('/api/user/using/2');
    });
  });

  describe('set URL options', function() {
    it('with auth.', function() {
      grafana.auth = {username: 'admin', password: 'admin'};
      var options = grafana.setURLOptions();
      expect(options.auth.username).to.equal('admin');
    });
  });

});