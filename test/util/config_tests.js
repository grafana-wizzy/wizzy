const { expect } = require('chai');
const sinon = require('sinon');
const nconf = require('nconf');

const Config = require('../../src/util/config.js');

let config;
let storedConfig;

beforeEach(() => {
  config = new Config();
  storedConfig = { config: { grafana: { url: 'http://localhost:3000' } } };
});

afterEach(() => {
  config = null;
  storedConfig = {};
});

describe('Checking show config function', () => {
  beforeEach(() => {
    sinon.stub(config.localfs, 'checkExists').returns(true);
    sinon.stub(nconf, 'get').returns(storedConfig);
  });

  afterEach(() => {
    config.localfs.checkExists.restore();
    nconf.get.restore();
  });

  it('should display wizzy conf', () => {
    const configuration = config.getProperty('config');
    expect(configuration).to.equal(storedConfig);
  });

  it('should find configuration', () => {
    const found = config.statusCheck(false);
    expect(found).to.equal(true);
  });
});
