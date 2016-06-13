var T = require('terrific');
var mainApplication = new T.Application();

module.exports = {
  mainApplication: mainApplication,
  applyTerrific: function(domNode) {
    // get terrific component name
    var dataName = domNode.getAttribute('data-t-name');
    // link terrific component to dom node
    var mod = mainApplication.registerModule(domNode, dataName);
    if ( mod ) {
      // execute terrific component
      mainApplication.start([mod]);
    }
    // Return the public api
    return ( mod && mod.api ) ? mod.api : {};
  }
};
