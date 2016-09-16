import { OpenIdClient } from './aurelia-openid';

export function configure(aurelia, callback) {
  let instance = aurelia.container.get(OpenIdClient);

  if (callback !== undefined && typeof callback === 'function') {
    callback(instance);
  }
}

export { OpenIdClient };