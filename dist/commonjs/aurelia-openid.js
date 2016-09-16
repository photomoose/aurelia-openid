'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenIdClient = undefined;

var _dec, _class;

var _aureliaFramework = require('aurelia-framework');

var _oidcClient = require('oidc-client');

var _aureliaEventAggregator = require('aurelia-event-aggregator');

var _aureliaApi = require('aurelia-api');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OpenIdClient = exports.OpenIdClient = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator, _aureliaApi.Config), _dec(_class = function () {
  function OpenIdClient(eventAggregator, clientConfig) {
    _classCallCheck(this, OpenIdClient);

    this.ea = eventAggregator;
    this.clientConfig = clientConfig;
  }

  OpenIdClient.prototype.configure = function configure(config) {
    var _this = this;

    this.config = config;

    if (this.config.enableLogging) {
      _oidcClient.Log.logger = console;
    }

    _oidcClient.Log.info('Configuring aurelia-openid...');

    if (!this.config.openId) {
      throw new Error('Missing configuration for OpenID.');
    }

    var openIdConfig = this.config.openId;

    if (openIdConfig.userStore !== undefined) {
      openIdConfig.userStore = new _oidcClient.WebStorageStateStore({ store: openIdConfig.userStore });
    }

    this.userManager = new _oidcClient.UserManager(openIdConfig);

    this.userManager.events.addUserLoaded(function (user) {
      _this.isAuthenticated = true;
      _this.ea.publish('openid.userLoaded', user);
    });

    this.userManager.events.addUserUnloaded(function () {
      _this.isAuthenticated = false;
      _this.ea.publish('openid.userUnloaded');
    });

    this.userManager.events.addUserSignedOut(function (e) {
      _this.isAuthenticated = false;
      _this.ea.publish('openid.userSignedOut');
    });

    if (Array.isArray(config.endpoints)) {
      config.endpoints.forEach(function (endpointToPatch) {
        _this._configureEndpoint(endpointToPatch);
      });
    }

    this.userManager.getUser().then(function (user) {
      _this.isAuthenticated = user !== null && !user.expired;
    });
  };

  OpenIdClient.prototype.signin = function signin(referrerUrl) {
    var args = referrerUrl ? { data: referrerUrl } : undefined;

    return this.userManager.signinRedirect(args);
  };

  OpenIdClient.prototype.signinCallback = function signinCallback() {
    return this.userManager.signinRedirectCallback();
  };

  OpenIdClient.prototype.signinSilentCallback = function signinSilentCallback() {
    return this.userManager.signinSilentCallback();
  };

  OpenIdClient.prototype.signoutRedirect = function signoutRedirect() {
    return this.userManager.signoutRedirect({
      post_logout_redirect_uri: this.config.openId.postLogoutRedirectUri
    });
  };

  OpenIdClient.prototype.getUser = function getUser() {
    return this.userManager.getUser();
  };

  OpenIdClient.prototype.removeUser = function removeUser() {
    return this.userManager.removeUser();
  };

  OpenIdClient.prototype._configureEndpoint = function _configureEndpoint(endpointName) {
    var _this2 = this;

    var endpoint = this.clientConfig.getEndpoint(endpointName);

    _oidcClient.Log.info('Applying authorization header interceptor to endpoint \'' + endpointName + '\'.');

    if (!endpoint) {
      throw new Error('There is no \'' + endpointName + '\' endpoint registered.');
    }
    var client = endpoint.client;
    client.interceptors.push({
      request: function request(_request) {
        return _this2.getUser().then(function (user) {
          if (user) {
            _request.headers.set('Authorization', 'Bearer ' + user.access_token);
          }

          return _request;
        });
      }
    });

    return client;
  };

  return OpenIdClient;
}()) || _class);