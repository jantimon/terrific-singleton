var T = require('terrific');
var mainApplication = new T.Application();

module.exports = {
  mainApplication: mainApplication,
  startNode: function(domNode) {
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
    return {
      api: mod.api || {},
      events: mod._events
    };
  },
  createModule: function(moduleName, moduleDefinitions) {
    if (typeof moduleName !== 'string' || !/^[A-Z][a-z0-9\-]+[a-z0-9]/.test(moduleName)) {
      throw new Error('Invalid module name "' + moduleName + '".');
    }
    if (T.Module[moduleName]) {
      throw new Error('Module "' + moduleName + '" was already defined.');
    }
    T.Module[moduleName] = T.createModule(moduleDefinitions);
    return T.Module[moduleName];
  }
};

// Inherit from terrific
for (var attribute in T) {
  if( T.hasOwnProperty( attribute ) && typeof attribute === 'function' ) {
    module.exports[attribute] = module.exports[attribute] || T[attribute];
  }
}
