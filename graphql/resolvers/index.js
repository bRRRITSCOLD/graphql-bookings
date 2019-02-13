/* resolvers */
const eventsResolver = require('./events');
const usersResolver = require('./users');
const bookingsResolver = require('./bookings');

module.exports = {
  ...eventsResolver,
  ...usersResolver,
  ...bookingsResolver
};