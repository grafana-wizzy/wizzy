#!/usr/bin/env node
"use strict";

var expect = require('chai').expect;

var Logger = require('../src/logger.js');
var logger;

// Create a new Logger object for each test
beforeEach(function() {
  logger = new Logger('Test');
});

afterEach(function() {
  logger = null;
})

describe('Check Logger stringify', function() {
	it('should stringify JSON.', function() {
    var stringifiedJSON = logger.stringify({name: 'michael', game: 'basketball'})
		expect(stringifiedJSON).to.equal(JSON.stringify({name: 'michael', game: 'basketball'}, null, 2));
	});
});