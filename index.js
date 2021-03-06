var T = require('terrific');
var mainApplication = new T.Application();

// The deferred bootstrap holds a promise which will be fullfilled
// once the main application was bootet
var deferredMainApplicationStarted = createDeferred();

// A queue to store terrific modules which are currently booting up
// this will be used for the initial bootstrap and
// for lazy/ajax initialisations
var moduleStartQueue = deferredMainApplicationStarted.promise;
function addModuleToInitialisationQueue (modulePromise) {
  moduleStartQueue = moduleStartQueue.then(function () {
    return modulePromise;
  });
}

module.exports = {
  mainApplication: mainApplication,

  startNode: function (domNode) {
    var modulePromise = deferredMainApplicationStarted.promise.then(function () {
      // if the node was already started return the module
      if (domNode.hasAttribute('data-t-id')) {
        return mainApplication.getModuleById(domNode.getAttribute('data-t-id'));
      }
      // get terrific component name
      var dataName = domNode.getAttribute('data-t-name');
      // link terrific component to dom node
      var mod = mainApplication.registerModule(domNode, dataName);
      if (!mod) {
        throw new Error('starting terrific component "' + dataName + '" failed.');
      }
      // execute terrific component
      return mainApplication.start([mod])
        // Return the public api and events
        .then(function () {
          return mod;
        });
    });
    // Add the module to the queue for the waitForModuleInitialisiation helper
    addModuleToInitialisationQueue(modulePromise);
    return modulePromise;
  },

  /**
   *  Returns the Terrific Module instance for the given dom node
   * @param  {HTMLElement} domNode
   */
  getModuleByDomNode: function (domNode) {
    if (domNode.hasAttribute('data-t-id')) {
      var id = domNode.getAttribute('data-t-id');
      return mainApplication.getModuleById(id);
    }
    return undefined;
  },

  stopNode: function (domNode) {
    var module = this.getModuleByDomNode(domNode);
    if (module) {
      var modules = {};
      modules[domNode.getAttribute('data-t-id')] = module;
      mainApplication.stop(modules);
      mainApplication.unregisterModules(modules);
    }
  },

  /**
   * Returns a promise which will be resolved once the
   * terrific bootstrap is finished
   */
  waitForBootstrap: function () {
    return deferredMainApplicationStarted.promise;
  },

  /**
   * Returns a promise which will be resolved once all modules
   * are initialized.
   * The difference to waitForBootstrap is that it will work not
   * only for the inital booting but also for later invoked module
   * initializations.
   */
  waitForModuleInitialisiation: function () {
    var queueStart = moduleStartQueue;
    return moduleStartQueue.then(function () {
      return moduleStartQueue !== queueStart
        ? this.waitForModuleInitialisiation()
        : undefined;
    }.bind(this));
  },

  /**
   * Start all terrific components which where registrered
   * and initialize all terrific modules found in the current dom
   */
  bootstrap: function () {
    mainApplication.registerModules();
    mainApplication.start().then(function (result) {
      deferredMainApplicationStarted.resolve(result);
    });
    return this.waitForBootstrap();
  },

  /**
   * Adds the module to the module registry
   * Function usage:
   *
   * createModule('Button', class Button extends TerrificSpec {
   *  start (resolve) {
   *    resolve();
   *  }
   * })
   *
   * Decorator usage:
   * @createModule('Button')
   * class Button extends TerrificSpec {
   *  start (resolve) {
   *    resolve();
   *  }
   * }
   */
  createModule: function (moduleName, moduleDefinitions) {
    if (typeof moduleName !== 'string' || !/^[A-Z][A-Za-z0-9]+/.test(moduleName)) {
      throw new Error('Invalid module name "' + moduleName + '".');
    }
    if (T.Module[moduleName]) {
      throw new Error('Module "' + moduleName + '" was already defined.');
    }
    var decorator = function (moduleDefinitions) {
      // Allow to create by class
      if (moduleDefinitions && moduleDefinitions.prototype && moduleDefinitions.prototype.start) {
        moduleDefinitions = moduleDefinitions.prototype;
      }
      // Fix memory leak in TerrificJs
      if (moduleDefinitions.hasOwnProperty('stop')) {
        var stop = moduleDefinitions.stop;
        moduleDefinitions.stop = function () {
          T.Module.prototype.stop.apply(this, arguments);
          stop.apply(this, arguments);
        };
      }
      T.Module[moduleName] = T.createModule(moduleDefinitions);
      return T.Module[moduleName];
    };
    // Allow to use createModule either as function or as decorator
    return moduleDefinitions !== undefined ? decorator(moduleDefinitions) : decorator;
  }
};

// Inherit from terrific
for (var attribute in T) {
  /* istanbul ignore else */
  if (T.hasOwnProperty(attribute)) {
    module.exports[attribute] = module.exports[attribute] || T[attribute];
  }
}

/**
 * Create a deferred promise object
 */
function createDeferred () {
  var deferred = {};
  deferred.promise = new Promise(function (resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
}
