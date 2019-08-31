/* eslint-disable no-console */
const { expect } = require('chai');
const { assert } = require('chai');
const sinon = require('sinon');

const Logger = require('../../src/util/logger.js');

let logger;

// Create a new Logger object for each test
beforeEach(() => {
  logger = new Logger('Test');
});

afterEach(() => {
  logger = null;
});

describe('Check Logger stringify', () => {
  it('should stringify JSON.', () => {
    const stringifiedJSON = logger.stringify({ name: 'michael', game: 'basketball' });
    expect(stringifiedJSON).to.equal(JSON.stringify({ name: 'michael', game: 'basketball' }, null, 2));
  });
});

describe('Checking Logger outputs', () => {
  beforeEach(() => {
    sinon.stub(console, 'log').returns(undefined);
    sinon.stub(console, 'error').returns(undefined);
  });

  afterEach(() => {
    console.log.restore();
    console.error.restore();
  });

  describe('when showing result', () => {
    it('should show in cyan color with green checkmark.', () => {
      logger.showResult('Good morning in cyan');

      assert.isTrue(console.log.called, 'log should have been called.');
      assert.equal(console.log.callCount, 1);
      assert.isTrue(console.log.calledOnce);
      expect(console.log.getCall(0).args[0]).to.equal('\u2714 '.green + 'Good morning in cyan'.cyan);
    });
  });

  describe('when showing error', () => {
    it('should show in cyan color with red cross.', () => {
      logger.showError('Good morning in red');

      assert.isTrue(console.error.called, 'error should have been called.');
      assert.equal(console.error.callCount, 1);
      assert.isTrue(console.error.calledOnce);
      expect(console.error.getCall(0).args[0]).to.equal('\u2718 '.red + 'Good morning in red'.cyan);
    });
  });

  describe('when showing output', () => {
    it('should show in yellow color with Output in cyan.', () => {
      logger.showOutput('Good morning in yellow with Output in cyan.');

      assert.isTrue(console.log.called, 'log should have been called.');
      assert.equal(console.log.callCount, 1);
      assert.isTrue(console.log.calledOnce);
      expect(console.log.getCall(0).args[0]).to.equal('Output:\n'.cyan + 'Good morning in yellow with Output in cyan.'.yellow);
    });
  });

  describe('when showing log in debug mode', () => {
    it('should show with logger name.', () => {
      logger.debug('Good morning');

      assert.isTrue(console.log.called, 'log should have been called.');
      assert.equal(console.log.callCount, 1);
      assert.isTrue(console.log.calledOnce);
      expect(console.log.getCall(0).args[0]).to.equal('\u2714 Test: Good morning');
    });
  });

  describe('when showing just output', () => {
    it('should show in yellow color.', () => {
      logger.justShow('Good morning in yellow');

      assert.isTrue(console.log.called, 'error should have been called.');
      assert.equal(console.log.callCount, 1);
      assert.isTrue(console.log.calledOnce);
      expect(console.log.getCall(0).args[0]).to.equal('Good morning in yellow'.yellow);
    });
  });
});
