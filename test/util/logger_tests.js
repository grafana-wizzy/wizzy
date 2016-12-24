#!/usr/bin/env node
"use strict";

var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon  = require("sinon");
var colors = require('colors');

var Logger = require('../../src/util/logger.js');
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

describe('Checking Logger outputs', function() {

	beforeEach(function() {
    sinon.stub(console, "log").returns(void 0);
    sinon.stub(console, "error").returns(void 0);
  });

  afterEach(function() {
    console.log.restore();
    console.error.restore();
  });

	describe('when showing result', function() {
		it('should show in cyan color with green checkmark.', function() {

			logger.showResult('Good morning in cyan');
    	
    	assert.isTrue(console.log.called, "log should have been called.");
      assert.equal(console.log.callCount, 1);
      assert.isTrue(console.log.calledOnce);
      expect(console.log.getCall(0).args[0]).to.equal('\u2714 '.green + 'Good morning in cyan'.cyan);
		});
	});

	describe('when showing error', function() {
		it('should show in cyan color with red cross.', function() {

			logger.showError('Good morning in red');
    	
    	assert.isTrue(console.error.called, "error should have been called.");
      assert.equal(console.error.callCount, 1);
      assert.isTrue(console.error.calledOnce);
      expect(console.error.getCall(0).args[0]).to.equal('\u2718 '.red + 'Good morning in red'.cyan);
		});
	});

  describe('when showing output', function() {
    it('should show in yellow color with Output in cyan.', function() {

      logger.showOutput('Good morning in yellow with Output in cyan.');
      
      assert.isTrue(console.log.called, "log should have been called.");
      assert.equal(console.log.callCount, 1);
      assert.isTrue(console.log.calledOnce);
      expect(console.log.getCall(0).args[0]).to.equal('Output:\n'.cyan + 'Good morning in yellow with Output in cyan.'.yellow);
    });
  });

	describe('when showing log in debug mode', function() {
		it('should show with logger name.', function() {

			logger.debug('Good morning');
    	
    	assert.isTrue(console.log.called, "log should have been called.");
      assert.equal(console.log.callCount, 1);
      assert.isTrue(console.log.calledOnce);
      expect(console.log.getCall(0).args[0]).to.equal('\u2714 ' + 'Test' + ': Good morning');
		});
	});

	describe('when showing just output', function() {
		it('should show in yellow color.', function() {

			logger.justShow('Good morning in yellow');
    	
    	assert.isTrue(console.log.called, "error should have been called.");
      assert.equal(console.log.callCount, 1);
      assert.isTrue(console.log.calledOnce);
      expect(console.log.getCall(0).args[0]).to.equal('Good morning in yellow'.yellow);
		});
	});



});