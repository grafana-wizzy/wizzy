#!/usr/bin/env node
"use strict";

const expect = require('chai').expect;
const sinon  = require("sinon");
const nconf = require('nconf');

const Config = require('../../src/util/config.js');

var config;
var storedConfig;

beforeEach(function() {
  config = new Config();
  storedConfig = {config: { grafana: {url: 'http://localhost:3000'}}};
});

afterEach(function() {
  config = null;
  storedConfig = {};
});

describe('Checking show config function', function() {

  beforeEach(function() {
    sinon.stub(config.localfs, "checkExists").returns(true);
    sinon.stub(nconf, "get").returns(storedConfig);
  });

  afterEach(function() {
    config.localfs.checkExists.restore();
    nconf.get.restore();
  });

  it('should display wizzy conf', function() {
    var configuration = config.getProperty('config');
    expect(configuration).to.equal(storedConfig);
  });

  it('should find configuration', function() {
    var found = config.statusCheck(false);
    expect(found).to.equal(true);
  })

});
