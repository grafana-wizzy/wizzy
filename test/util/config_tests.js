#!/usr/bin/env node
"use strict";

var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon  = require("sinon");
var colors = require('colors');

var LocalFS = require('../../src/util/localfs.js');
var localfs = new LocalFS();
var nconf = require('nconf');

var Config = require('../../src/util/config.js');
var config;

var confDir = 'conf';
var confFile = 'conf/wizzy.json';

var conf;
// Create a new Logger object for each test
beforeEach(function() {
  config = new Config(confDir, confFile);
  conf = {config: { grafana: {url: 'http://localhost:3000'}}};
});

afterEach(function() {
  config = null;
  conf = {};
});

describe('Checking show config function', function() {

  beforeEach(function() {
    sinon.stub(localfs, "checkExists").returns(true);
    sinon.stub(nconf, "get").returns(conf);
  });

  afterEach(function() {
    localfs.checkExists.restore();
    nconf.get.restore();
  });

  it('should display wizzy conf', function() {
    var configuration = config.getProperty('config');
    expect(configuration).to.equal(conf);
  });

  it('should find configuration', function() {
    var found = config.statusCheck(false);
    expect(found).to.equal(true);
  })

});