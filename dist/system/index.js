'use strict';

System.register(['./aurelia-openid'], function (_export, _context) {
  "use strict";

  var OpenIdClient;
  function configure(aurelia, callback) {
    var instance = aurelia.container.get(OpenIdClient);

    if (callback !== undefined && typeof callback === 'function') {
      callback(instance);
    }
  }

  _export('configure', configure);

  return {
    setters: [function (_aureliaOpenid) {
      OpenIdClient = _aureliaOpenid.OpenIdClient;
    }],
    execute: function () {
      _export('OpenIdClient', OpenIdClient);
    }
  };
});