var T = require('terrific');
var mainApplication = new T.Application();

// The deferred bootstrap holds a promise which will be fullfilled
// once the main application was bootet
var deferredMainApplicationStarted = createDeferred();

module.exports = {
  mainApplication: mainApplication,

  startNode: function (domNode) {
    return deferredMainApplicationStarted.promise.then(function () {
      // if the node was already started return the module
      if (domNode.hasAttribute('data-t-id')) {
        return Promise.resolve(mainApplication.getModuleById(domNode.getAttribute('data-t-id')));
      }
      // get terrific component name
      var dataName = domNode.getAttribute('data-t-name');
      // link terrific component to dom node
      var mod = mainApplication.registerModule(domNode, dataName);
      if (!mod) {
        throw new Error('starting terrific component "' + dataName + '" failed.');
      }
      // execute terrific component
      mainApplication.start([mod]);
      // Return the public api and events
      return mod;
    });
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

  bootstrap: function () {
    mainApplication.registerModules();
    return mainApplication.start().then(function (result) {
      deferredMainApplicationStarted.resolve(result);
      return result;
    });
  },

  createModule: function (moduleName, moduleDefinitions) {
    if (typeof moduleName !== 'string' || !/^[A-Z][A-Za-z0-9]+/.test(moduleName)) {
      throw new Error('Invalid module name "' + moduleName + '".');
    }
    if (T.Module[moduleName]) {
      throw new Error('Module "' + moduleName + '" was already defined.');
    }
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
