const Joi = require('joi');

const _validate = async (object, schema) => {
  try {
    const _v = (o, s) => {
      return new Promise((resolve, reject) => {
        Joi.validate(o, s, (e, v) => {
          if (e) return reject(e);
          return resolve(v);
        });
      });
    };

    const validated = await _v(object, schema);

    return validated;
  } catch (err) {
    throw err;
  }
};

class Joii {
  constructor() {
    this.validate = _validate;
  }
}

module.exports = {
  Joii
};
