#!/usr/bin/env node
"use strict";

var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon  = require("sinon");
var colors = require('colors');

var Commands = require('../src/commands.js');
var commands;

// Create a new Logger object for each test
beforeEach(function() {
  var dashDir = 'dashboards';
  var confDir = 'conf';
  var confFile = 'wizzy.conf';
  commands = new Commands(dashDir, confDir, confFile);
});

afterEach(function() {
  commands = null;
})

describe('Check Commands outputs', function() {

  beforeEach(function() {
    sinon.stub(console, "log").returns(void 0);
    sinon.stub(console, "error").returns(void 0);
  });

  afterEach(function() {
    console.log.restore();
    console.error.restore();
  });

  describe('when showing help', function() {

  	it('should print Help with indentation.', function() {
      commands.instructions('help');
  		assert.isTrue(console.log.called, "log should have been called.");
      assert.equal(console.log.callCount, 1);
      assert.isTrue(console.log.calledOnce);

      var help = '\nUsage: wizzy [commands]\n\n' +
                 'Commands:\n\n' +
                 '  wizzy help - shows available wizzy commands\n' +
                 '  wizzy init - creates conf file with conf and dashboards directories.\n' +
                 '  wizzy status - checks if any configuration property and if .git directory exists.\n' +
                 '  wizzy conf - shows wizzy configuration properties.\n' +
                 '  wizzy set CONFIG_NAME PROPERTY_NAME PROPERTY_VALUE - sets a configuration property for wizzy\n' +
                 '  wizzy copy ENTITY ENTITY_NAME - copies an entity from one position to another\n' +
                 '  wizzy create ENTITY ENTITY_NAME - creates a new entity\n' +
                 '  wizzy delete ENTITY ENTITY_NAME - deletes an entity\n' +
                 '  wizzy export ENTITY ENTITY_NAME - exports an entity from local repo to Grafana\n' +
                 '  wizzy list ENTITIES - lists entities in Grafana\n' +
                 '  wizzy import ENTITY ENTITY_NAME - imports an entity from Grafana to local repo\n' +
                 '  wizzy move ENTITY ENTITY_NAME - moves an entity from one position to another\n' +
                 '  wizzy show ENTITY ENTITY_NAME - shows an entity\n' +
                 '  wizzy summarize ENTITY ENTITY_NAME - summarize a large entity in a short user-friendly manner\n';

      expect(console.log.getCall(0).args[0]).to.equal(help.yellow);
  	});

  });

});