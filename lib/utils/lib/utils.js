/* internals */
const { Common } = require('./common');
const { Joii } = require('./joi');

class Utils {
  constructor() {
    this._common = new Common();
    this._joi = new Joii();
  }

  get common() {
    return this._common;
  }

  get joi() {
    return this._joi;
  }
}

module.exports = {
  Utils
};
