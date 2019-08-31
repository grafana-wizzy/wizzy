/* eslint-disable no-console */
const { expect } = require('chai');
const { assert } = require('chai');
const sinon = require('sinon');

const fs = require('fs');
const LocalFS = require('../../src/util/localfs.js');

let localfs;

beforeEach(() => {
  localfs = new LocalFS();
});

afterEach(() => {
  localfs = null;
});

describe('Checking output when file or dir exists', () => {
  beforeEach(() => {
    sinon.stub(fs, 'existsSync').returns(true);
    sinon.stub(fs, 'mkdirSync').returns(undefined);
    sinon.stub(console, 'log').returns(undefined);
  });

  afterEach(() => {
    fs.existsSync.restore();
    fs.mkdirSync.restore();
    console.log.restore();
  });

  it('should return true when no output is displayed', () => {
    const result = localfs.checkExists('dashboards');
    expect(result).to.equal(true);
  });

  it('should display that file or dir exists', () => {
    const result = localfs.checkExists('dashboards', 'Dashboards', true);
    expect(result).to.equal(true);
    assert.isTrue(console.log.called, 'log should have been called.');
    assert.equal(console.log.callCount, 1);
    assert.isTrue(console.log.calledOnce);
    expect(console.log.getCall(0).args[0]).to.equal('\u2714 '.green + 'Dashboards exists.'.cyan);
  });

  it('should display that directory already exists', () => {
    localfs.createDirIfNotExists('dashboards', true);
    assert.isTrue(console.log.called, 'log should have been called.');
    assert.equal(console.log.callCount, 1);
    assert.isTrue(console.log.calledOnce);
    expect(console.log.getCall(0).args[0]).to.equal('\u2714 '.green + 'dashboards directory already exists.'.cyan);
  });
});

describe('Checking output when file or dir does not exists', () => {
  beforeEach(() => {
    sinon.stub(fs, 'existsSync').returns(false);
    sinon.stub(fs, 'mkdirSync').returns(undefined);
    sinon.stub(console, 'log').returns(undefined);
  });

  afterEach(() => {
    fs.existsSync.restore();
    fs.mkdirSync.restore();
    console.log.restore();
  });

  it('should return true when no output is displayed', () => {
    const result = localfs.checkExists('dashboards');
    expect(result).to.equal(false);
  });

  it('should display that file or dir exists', () => {
    const result = localfs.checkExists('dashboards', 'Dashboards', true);
    expect(result).to.equal(false);
    assert.isTrue(console.log.called, 'log should have been called.');
    assert.equal(console.log.callCount, 1);
    assert.isTrue(console.log.calledOnce);
    expect(console.log.getCall(0).args[0]).to.equal('Dashboards does not exists.'.yellow);
  });

  it('should display that directory does not exists', () => {
    localfs.createDirIfNotExists('dashboards', true);
    assert.isTrue(console.log.called, 'log should have been called.');
    assert.equal(console.log.callCount, 1);
    assert.isTrue(console.log.calledOnce);
    expect(console.log.getCall(0).args[0]).to.equal('\u2714 '.green + 'dashboards directory created.'.cyan);
  });
});
