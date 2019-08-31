const { expect } = require('chai');

const Grafana = require('../../src/remote/grafana.js');

const config = {
  grafana: {
    url: 'http://localhost:3000',
    username: 'admin',
    password: 'password',
  },
};

const components = {};

let grafana;

// Create a new Grafana object for each test
beforeEach(() => {
  grafana = new Grafana(config, components);
});

afterEach(() => {
  grafana = null;
});

describe('Check Grafana URLs', () => {
  describe('create URL for listing all dashboards', () => {
    it('should return URL /api/search .', () => {
      const url = grafana.createURL('list', 'dashboards');
      expect(url).to.equal('/api/search');
    });
  });

  describe('create URL for showing a dashboard', () => {
    it('should return URL /api/dashboards/db/:slug .', () => {
      const url = grafana.createURL('show', 'dashboard', 'test-dash');
      expect(url).to.equal('/api/dashboards/db/test-dash');
    });
  });

  describe('create URL for importing a dashboard', () => {
    it('should return URL /api/dashboards/db/:slug .', () => {
      const url = grafana.createURL('import', 'dashboard', 'test-dash');
      expect(url).to.equal('/api/dashboards/db/test-dash');
    });
  });

  describe('create URL for exporting a dashboard', () => {
    it('should return URL /api/dashboards/db .', () => {
      const url = grafana.createURL('export', 'dashboard', 'test-dash');
      expect(url).to.equal('/api/dashboards/db');
    });
  });

  describe('create URL for deleting a dashboard', () => {
    it('should return URL /api/dashboards/db .', () => {
      const url = grafana.createURL('delete', 'dashboard', 'test-dash');
      expect(url).to.equal('/api/dashboards/db/test-dash');
    });
  });

  describe('create URL for showing all orgs', () => {
    it('should return URL /api/orgs .', () => {
      const url = grafana.createURL('show', 'orgs');
      expect(url).to.equal('/api/orgs');
    });
  });

  describe('create URL for showing an org', () => {
    it('should return URL /api/orgs/:orgId .', () => {
      const url = grafana.createURL('show', 'org', 12);
      expect(url).to.equal('/api/orgs/12');
    });
  });

  describe('create URL for creating an org', () => {
    it('should return URL /api/orgs .', () => {
      const url = grafana.createURL('create', 'org', 'test-org');
      expect(url).to.equal('/api/orgs');
    });
  });

  describe('create URL for deleting an org', () => {
    it('should return URL /api/org .', () => {
      const url = grafana.createURL('delete', 'org', 12);
      expect(url).to.equal('/api/orgs/12');
    });
  });

  describe('create URL for importing all orgs', () => {
    it('should return URL /api/orgs .', () => {
      const url = grafana.createURL('import', 'orgs');
      expect(url).to.equal('/api/orgs');
    });
  });

  describe('create URL for importing an org', () => {
    it('should return URL /api/orgs/:orgId .', () => {
      const url = grafana.createURL('import', 'org', 12);
      expect(url).to.equal('/api/orgs/12');
    });
  });

  describe('create URL for exporting an org', () => {
    it('should return URL /api/orgs/:orgId .', () => {
      const url = grafana.createURL('export', 'org', 12);
      expect(url).to.equal('/api/orgs/12');
    });
  });

  describe('create URL for showing all datasources', () => {
    it('should return URL /api/datasources .', () => {
      const url = grafana.createURL('show', 'datasources');
      expect(url).to.equal('/api/datasources');
    });
  });

  describe('create URL for showing a datasource', () => {
    it('should return URL /api/datasources/:datasourceId .', () => {
      const url = grafana.createURL('show', 'datasource', 1);
      expect(url).to.equal('/api/datasources/name/1');
    });
  });

  describe('create URL for importing all datasources', () => {
    it('should return URL /api/datasources .', () => {
      const url = grafana.createURL('import', 'datasources');
      expect(url).to.equal('/api/datasources');
    });
  });

  describe('create URL for importing a datasource', () => {
    it('should return URL /api/datasources/:datasourceId .', () => {
      const url = grafana.createURL('import', 'datasource', 1);
      expect(url).to.equal('/api/datasources/name/1');
    });
  });

  describe('create URL for exporting a datasource', () => {
    it('should return URL /api/datasources/:datasourceId .', () => {
      const url = grafana.createURL('export', 'datasource', 1);
      expect(url).to.equal('/api/datasources/1');
    });
  });

  describe('create URL for switching an org', () => {
    it('should return URL /api/user/using/:orgId .', () => {
      const url = grafana.createURL('switch', 'org', 2);
      expect(url).to.equal('/api/user/using/2');
    });
  });

  describe('set URL options', () => {
    it('with auth.', () => {
      grafana.auth = { username: 'admin', password: 'admin' };
      const options = grafana.setURLOptions();
      expect(options.auth.username).to.equal('admin');
    });
  });
});
