var _dec, _class;

import { inject } from 'aurelia-framework';
import { Log, UserManager, WebStorageStateStore } from 'oidc-client';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Config } from 'aurelia-api';

export let OpenIdClient = (_dec = inject(EventAggregator, Config), _dec(_class = class OpenIdClient {
  constructor(eventAggregator, clientConfig) {
    this.ea = eventAggregator;
    this.clientConfig = clientConfig;
  }

  configure(config) {
    this.config = config;

    if (this.config.enableLogging) {
      Log.logger = console;
    }

    Log.info('Configuring aurelia-openid...');

    if (!this.config.openId) {
      throw new Error('Missing configuration for OpenID.');
    }

    let openIdConfig = this.config.openId;

    if (openIdConfig.userStore !== undefined) {
      openIdConfig.userStore = new WebStorageStateStore({ store: openIdConfig.userStore });
    }

    this.userManager = new UserManager(openIdConfig);

    this.userManager.events.addUserLoaded(user => {
      this.isAuthenticated = true;
      this.ea.publish('openid.userLoaded', user);
    });

    this.userManager.events.addUserUnloaded(() => {
      this.isAuthenticated = false;
      this.ea.publish('openid.userUnloaded');
    });

    this.userManager.events.addUserSignedOut(e => {
      this.isAuthenticated = false;
      this.ea.publish('openid.userSignedOut');
    });

    this.userManager.events.addSilentRenewError(e => {
      this.ea.publish('openid.silentRenewError');
    });

    this.userManager.events.addAccessTokenExpired(e => {
      this.isAuthenticated = false;
      this.ea.publish('openid.accessTokenExpired');
    });

    this.userManager.events.addAccessTokenExpiring(e => {
      this.ea.publish('openid.accessTokenExpiring');
    });

    if (Array.isArray(config.endpoints)) {
      config.endpoints.forEach(endpointToPatch => {
        this._configureEndpoint(endpointToPatch);
      });
    }

    this.userManager.getUser().then(user => {
      this.isAuthenticated = user !== null && !user.expired;
    });
  }

  signin(referrerUrl) {
    let args = referrerUrl ? { data: referrerUrl } : undefined;

    return this.userManager.signinRedirect(args);
  }

  signinSilent() {
    return this.userManager.signinSilent();
  }

  signinCallback() {
    return this.userManager.signinRedirectCallback();
  }

  signinSilentCallback() {
    return this.userManager.signinSilentCallback();
  }

  signoutRedirect() {
    return this.userManager.signoutRedirect({
      post_logout_redirect_uri: this.config.openId.postLogoutRedirectUri
    });
  }

  getUser() {
    return this.userManager.getUser();
  }

  removeUser() {
    return this.userManager.removeUser();
  }

  clearStaleState() {
    return this.userManager.clearStaleState();
  }

  _configureEndpoint(endpointName) {
    let endpoint = this.clientConfig.getEndpoint(endpointName);

    Log.info(`Applying authorization header interceptor to endpoint '${ endpointName }'.`);

    if (!endpoint) {
      throw new Error(`There is no '${ endpointName }' endpoint registered.`);
    }
    let client = endpoint.client;
    client.interceptors.push({
      request: request => {
        return this.getUser().then(user => {
          if (user) {
            request.headers.set('Authorization', `Bearer ${ user.access_token }`);
          }

          return request;
        });
      }
    });

    return client;
  }
}) || _class);