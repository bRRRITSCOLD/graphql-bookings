const { Logger } = require('./lib/logger');

const logger = new Logger({
  colors: true
});

module.exports = {
  logger
};
