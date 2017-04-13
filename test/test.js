'use strict';
/* global it, before, describe */
var jsdom = require('mocha-jsdom');
var chai = require('chai');
chai.use(require('chai-as-promised'));
var assert = chai.assert;
var sinon = require('sinon');

describe('terrific-singleton', function () {
  var ts;
  var bs;
  jsdom({skipWindowCheck: true});
  global.Element = { prototype: { matches: function () { return false; } } };

  before(function () {
    ts = require('../index.js');
    bs = ts.bootstrap();
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
    it('can be initialized with a class', function () {
      function ModuleClass () { }
      ModuleClass.prototype.start = function (resolve) {
        resolve();
      };
      ModuleClass.prototype.stop = function () {
      };
      var mod = ts.createModule('ClassMod', ModuleClass);
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
      sinon.stub(ts.mainApplication, 'start').onCall(0).returns(Promise.resolve());
      sinon.stub(ts.mainApplication, 'registerModules');
      ts.bootstrap();
      assert(ts.mainApplication.start.calledOnce);
      ts.mainApplication.start.restore();
      assert(ts.mainApplication.registerModules.calledOnce);
      ts.mainApplication.registerModules.restore();
    });

    it('returns a Promise', function () {
      assert(bs instanceof Promise);
    });
  });

  describe('startNode', function () {
    it('fails without arguments', function () {
      return assert.isRejected(ts.startNode(), Error);
    });
    it('fails with given DOM without data-t-name', function () {
      var el = document.createElement('div');
      return assert.isRejected(ts.startNode(el), Error);
    });
    it('fails for incorrectly setup module', function () {
      var el = document.createElement('div');
      el.setAttribute('data-t-name', 'NoMod');
      return assert.isRejected(ts.startNode(el), Error, /starting terrific component/);
    });
    it('returns object for correctly setup module', function () {
      var el = document.createElement('div');
      el.setAttribute('data-t-name', 'TestMod');
      sinon.stub(ts.mainApplication, 'start').onCall(0).returns(Promise.resolve());
      sinon.stub(ts.mainApplication, 'registerModules');
      ts.createModule('TestMod', {});
      ts.bootstrap();
      return ts.startNode(el).then(function (node) {
        assert.isObject(node);
        assert.equal(node._ctx, el);
        assert.isObject(node._events);
        ts.mainApplication.start.restore();
        ts.mainApplication.registerModules.restore();
      });
    });
    it('allows to be executed twice', function () {
      var el = document.createElement('div');
      el.setAttribute('data-t-name', 'TestMod');
      return ts.startNode(el)
        .then(function () {
          return ts.startNode(el);
        })
        .then(function (node) {
          assert.isObject(node);
          assert.equal(node._ctx, el);
          assert.isObject(node._events);
        });
    });
  });

  describe('stopNode', function () {
    it('destroys a initialized node', function () {
      var el = document.createElement('div');
      ts.createModule('TestStopMod', {stop: function () {}});
      el.setAttribute('data-t-name', 'TestStopMod');
      return ts.startNode(el)
        .then(function () {
          assert.isString(el.getAttribute('data-t-id'));
          ts.stopNode(el);
          assert.equal(el.getAttribute('data-t-id'), null);
        });
    });
    it('does not fail if a node was already destroyed', function () {
      var el = document.createElement('div');
      el.setAttribute('data-t-name', 'TestStopMod');
      return ts.startNode(el)
        .then(function () {
          assert.isString(el.getAttribute('data-t-id'));
          ts.stopNode(el);
          ts.stopNode(el);
          assert.equal(el.getAttribute('data-t-id'), null);
        });
    });
    it('calls the stop method even if the module has its own', function () {
      var el = document.createElement('div');
      el.setAttribute('data-t-name', 'TestStopMod');
      return ts.startNode(el)
        .then(function () {
          sinon.stub(ts.Module.prototype, 'stop');
          ts.stopNode(el);
          assert(ts.Module.prototype.stop.calledOnce);
          ts.Module.prototype.stop.restore();
        });
    });
  });

  describe('getModuleByDomNode', function () {
    it('returns the module', function () {
      var el = document.createElement('div');
      var moduleConfig = { demo: function () {} };
      ts.createModule('TestGetMod', moduleConfig);
      el.setAttribute('data-t-name', 'TestGetMod');
      return ts.startNode(el).then(function () {
        assert.equal(ts.getModuleByDomNode(el).demo, moduleConfig.demo);
      });
    });
  });
});
