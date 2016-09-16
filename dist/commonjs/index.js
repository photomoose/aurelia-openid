'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenIdClient = undefined;
exports.configure = configure;

var _aureliaOpenid = require('./aurelia-openid');

function configure(aurelia, callback) {
  var instance = aurelia.container.get(_aureliaOpenid.OpenIdClient);

  if (callback !== undefined && typeof callback === 'function') {
    callback(instance);
  }
}

exports.OpenIdClient = _aureliaOpenid.OpenIdClient;