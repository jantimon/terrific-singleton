'use strict';
/* global it, before, describe */
var jsdom = require('mocha-jsdom');
var assert = require('chai').assert;
var sinon = require('sinon');

describe('terrific-singleton', function () {
  var ts;
  jsdom({skipWindowCheck: true});

  before(function () {
    ts = require('../index.js');
  });

  describe('API methods are present', function () {
    it('mainApplication', function () {
      assert.isDefined(ts.mainApplication);
    });
    it('startNode', function () {
      assert.isDefined(ts.startNode);
    });
    it('createModule', function () {
      assert.isDefined(ts.createModule);
    });
  });

  describe('createModule', function () {
    it('fails for missing name', function () {
      assert.throws(function () {
        ts.createModule();
      }, Error);
    });
    it('fails for int name', function () {
      assert.throws(function () {
        ts.createModule(1);
      }, Error);
    });
    it('fails for boolean name', function () {
      assert.throws(function () {
        ts.createModule(true);
      }, Error);
    });
    it('fails for missing object', function () {
      assert.throws(function () {
        ts.createModule('SomeMod');
      }, Error);
    });
    it('returns an object', function () {
      var mod = ts.createModule('SomeMod', {});
      assert.isFunction(mod);
    });
    it('fails for double registration', function () {
      assert.throws(function () {
        ts.createModule('SomeMod', {});
      }, Error);
    });
  });

  describe('bootstrap', function () {
    it('launches the main application', function () {
      sinon.stub(ts.mainApplication, 'start');
      sinon.stub(ts.mainApplication, 'registerModules');
      ts.bootstrap();
      assert(ts.mainApplication.start.calledOnce);
      ts.mainApplication.start.restore();
      assert(ts.mainApplication.registerModules.calledOnce);
      ts.mainApplication.registerModules.restore();
    });
  });

  describe('startNode', function () {
    it('fails without arguments', function () {
      assert.throws(function () {
        ts.startNode();
      }, Error);
    });
    it('fails with given DOM without data-t-name', function () {
      var el = document.createElement('div');
      assert.throws(function () {
        ts.startNode(el);
      }, Error);
    });
    it('fails for incorrectly setup module', function () {
      var el = document.createElement('div');
      el.setAttribute('data-t-name', 'NoMod');
      assert.throws(function () {
        ts.startNode(el);
      }, Error, /starting terrific component/);
    });
    it('returns object for correctly setup module', function () {
      var el = document.createElement('div');
      el.setAttribute('data-t-name', 'TestMod');
      ts.createModule('TestMod', {});
      var node = ts.startNode(el);
      assert.isObject(node);
      assert.equal(node._ctx, el);
      assert.isObject(node._events);
    });
    it('allows to be executed twice', function () {
      var el = document.createElement('div');
      el.setAttribute('data-t-name', 'TestMod');
      ts.startNode(el);
      var node = ts.startNode(el);
      assert.isObject(node);
      assert.equal(node._ctx, el);
      assert.isObject(node._events);
    });
  });

  describe('stopNode', function () {
    it('destroys a initialized node', function () {
      var el = document.createElement('div');
      ts.createModule('TestStopMod', {});
      el.setAttribute('data-t-name', 'TestStopMod');
      ts.startNode(el);
      assert.isString(el.getAttribute('data-t-id'));
      ts.stopNode(el);
      assert.equal(el.getAttribute('data-t-id'), null);
    });
    it('does not fail if a node was already destroyed', function () {
      var el = document.createElement('div');
      el.setAttribute('data-t-name', 'TestStopMod');
      ts.startNode(el);
      assert.isString(el.getAttribute('data-t-id'));
      ts.stopNode(el);
      ts.stopNode(el);
      assert.equal(el.getAttribute('data-t-id'), null);
    });
  });
});
