#!/usr/bin/env node
"use strict";

var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon  = require("sinon");
var colors = require('colors');

var fs = require('fs');
var LocalFS = require('../../src/util/localfs.js');
var localfs;

beforeEach(function() {
	localfs = new LocalFS();
});

afterEach(function() {
  localfs = null;
});

describe('Checking output when file or dir exists', function() {

  beforeEach(function() {
    sinon.stub(fs, "existsSync").returns(true);
    sinon.stub(fs, "mkdirSync").returns(void 0);
    sinon.stub(console, "log").returns(void 0);
  });

  afterEach(function() {
    fs.existsSync.restore();
    fs.mkdirSync.restore();
    console.log.restore();
  });

  it('should return true when no output is displayed', function() {
    var result = localfs.checkExists('dashboards');
    expect(result).to.equal(true);
  });

  it('should display that file or dir exists', function() {
  	var result = localfs.checkExists('dashboards', 'Dashboards', true);
  	expect(result).to.equal(true);
  	assert.isTrue(console.log.called, "log should have been called.");
    assert.equal(console.log.callCount, 1);
    assert.isTrue(console.log.calledOnce);
    expect(console.log.getCall(0).args[0]).to.equal('\u2714 '.green + 'Dashboards exists.'.cyan);
  });

  it('should display that directory already exists', function() {
    localfs.createDirIfNotExists('dashboards',true);
    assert.isTrue(console.log.called, "log should have been called.");
    assert.equal(console.log.callCount, 1);
    assert.isTrue(console.log.calledOnce);
    expect(console.log.getCall(0).args[0]).to.equal('\u2714 '.green + 'dashboards directory already exists.'.cyan);
  });
  

});

describe('Checking output when file or dir does not exists', function() {

  beforeEach(function() {
    sinon.stub(fs, "existsSync").returns(false);
    sinon.stub(fs, "mkdirSync").returns(void 0);
    sinon.stub(console, "log").returns(void 0);
  });

  afterEach(function() {
    fs.existsSync.restore();
    fs.mkdirSync.restore();
    console.log.restore();
  });

  it('should return true when no output is displayed', function() {
    var result = localfs.checkExists('dashboards');
    expect(result).to.equal(false);
  });

  it('should display that file or dir exists', function() {
  	var result = localfs.checkExists('dashboards', 'Dashboards', true);
  	expect(result).to.equal(false);
  	assert.isTrue(console.log.called, "log should have been called.");
    assert.equal(console.log.callCount, 1);
    assert.isTrue(console.log.calledOnce);
    expect(console.log.getCall(0).args[0]).to.equal('Dashboards does not exists.'.yellow);
  });

  it('should display that directory does not exists', function() {
    localfs.createDirIfNotExists('dashboards',true);
    assert.isTrue(console.log.called, "log should have been called.");
    assert.equal(console.log.callCount, 1);
    assert.isTrue(console.log.calledOnce);
    expect(console.log.getCall(0).args[0]).to.equal('\u2714 '.green + 'dashboards directory created.'.cyan);
  });

});