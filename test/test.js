'use strict';

var jsdom = require('mocha-jsdom');
var assert = require('chai').assert;

describe('terrific-singleton', function() {
  var ts;
  jsdom();

  before(function() {
    ts = require('../index.js');
  });

  describe('API methods are present', function() {
    it('mainApplication', function() {
      assert.isDefined(ts.mainApplication);
    });
    it('startNode', function() {
      assert.isDefined(ts.startNode);
    });
    it('createModule', function() {
      assert.isDefined(ts.createModule);
    });
  });

  describe('createModule', function() {
    it('fails for missing name', function() {
      assert.throws(function() {
        ts.createModule();
      }, Error);
    });
    it('fails for int name', function() {
      assert.throws(function() {
        ts.createModule(1);
      }, Error);
    });
    it('fails for boolean name', function() {
      assert.throws(function() {
        ts.createModule(true);
      }, Error);
    });
    it('fails for missing object', function() {
      assert.throws(function() {
        ts.createModule('SomeMod');
      }, Error);
    });
    it('returns an object', function() {
      var mod = ts.createModule('SomeMod', {});
      assert.isFunction(mod);
    });
    it('fails for double registration', function() {
      assert.throws(function() {
        ts.createModule('SomeMod', {});
      }, Error);
    });
  });

  describe('startNode', function() {
    it('fails without arguments', function() {
      assert.throws(function() {
        ts.startNode();
      }, Error);
    });
    it('fails with given DOM without data-t-name', function() {
      var el = document.createElement('div');
      assert.throws(function() {
        ts.startNode(el);
      }, Error);
    });
    it('fails for incorrectly setup module', function() {
      var el = document.createElement('div');
      el.setAttribute('data-t-name', 'NoMod');
      assert.throws(function() {
        ts.startNode(el);
      }, Error, /starting terrific component/);
    });
    it('returns object for correctly setup module', function() {
      var el = document.createElement('div');
      el.setAttribute('data-t-name', 'TestMod');
      ts.createModule('TestMod', {
        start: function(resolve) {
          resolve();
        }
      });
      var node = ts.startNode(el);
      assert.isObject(node);
      assert.isObject(node.api);
      assert.isObject(node.events);
    });
  });
});
