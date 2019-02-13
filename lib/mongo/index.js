const { Mongo } = require('./lib/mongo');

const mongo = new Mongo();

module.exports = {
  mongo
};