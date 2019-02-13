const stringify = require('json-stringify-safe');

const _stringify = (thing, native = false) => {
  try {
    if (native) return JSON.stringify(thing);
    return stringify(thing);
  } catch (err) {
    throw err;
  }
};

class Common {
  constructor() {
    this.stringify = _stringify;
  }
}

module.exports = {
  Common
};
