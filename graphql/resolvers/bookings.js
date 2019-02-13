/* node_modules */
const { ObjectID } = require('mongodb');

/* libraries */
const { mongo } = require('../../lib/mongo');
const { logger } = require('../../lib/logger');
const { utils } = require('../../lib/utils');

/* models */
const { APIError } = require('../../models/errors');
const { Bookings, Booking } = require('../../models/bookings');
const { Eventt } = require('../../models/events');
const { User } = require('../../models/users');

/* shared resolvers */
const { findUser, findEvent, findBookings } = require('./shared');

module.exports = {
  bookings: async () => {
    try {
      const findAllResult = await Bookings.findAll();
  
      const bookings = await Bookings.create(findAllResult);
  
      return bookings.map((booking) => {
        return { ...booking, createdAt: new Date(booking.createdAt).toISOString(), modifiedAt: new Date(booking.modifiedAt).toISOString(), event: findEvent.bind(this, booking.event), user: findUser.bind(this, booking.user) }
      }) ;
    } catch (err) {
      logger.error(`{}Events::#events::error executing::error=${utils.common.stringify(APIError(err))}`);
      throw err;
    }
  },
  bookEvent: async (args) => {
    let session;

    try {
      const userId = new ObjectID(args.input.userId);
      const eventId = new ObjectID(args.input.eventId);

      const date = new Date();

      let booking = await Booking.create({
        _id: new ObjectID(),
        createdAt: date,
        modifiedAt: date,
        event: eventId,
        user: userId,
      }, true);
  
      const userFound = await User.findOne(userId);
      const eventFound = await Eventt.findOne(eventId);

      if (!userFound || !eventFound) {
        throw new Error('user does not exist');
      }
  
      session = await mongo.getSession('test');

      const insertOneResult = await Booking.insertOne(booking, session)
      const updateOneEvent = await Eventt.updateOne(eventId, { $push: { bookings: booking._id } }, session); // database.collection('events-booking').insertOne(event, { session });
      const updateOneUser = await User.updateOne(userId, { $push: { bookedEvents: booking._id } }, session); // database.collection('users-booking').updateOne({ _id: userId }, { $push: { createdEvents: event._id } }, { session });

      if (insertOneResult.insertedCount === 0 || updateOneEvent.modifiedCount === 0 || updateOneUser.modifiedCount === 0) throw new Error('failed to create event');

      await mongo.commitTransaction(session, true);
  
      return { 
        ...booking,
        createdAt: new Date(booking.createdAt).toISOString(),
        modifiedAt: new Date(booking.modifiedAt).toISOString(),
        user: findUser.bind(this, userId),
        event: findEvent.bind(this, eventId)
      };
    } catch (err) {
      logger.error(`{}Events::#createEvent::error executing::error=${utils.common.stringify(APIError(err))}`);
      session === undefined ? undefined : mongo.abortTransaction(session);
      throw err;
    }
  },
  cancelBooking: async (args) => {
    let session;

    try {
      const bookingId = new ObjectID(args.input.bookingId);

      const bookingFound = await Booking.findOne(bookingId);

      if (!bookingFound) {
        throw new Error('booking does not exist');
      }

      const eventFound = await Eventt.findOne(bookingFound.event);

      session = await mongo.getSession('test');

      const insertOneResult = await Booking.deleteOne(bookingId, session);
      const updateOneEvent = await Eventt.updateOne(bookingFound.event, { $pull: { bookings: bookingId } }, session); // database.collection('events-booking').insertOne(event, { session });
      const updateOneUser = await User.updateOne(bookingFound.user, { $pull: { bookedEvents: bookingId } }, session); // database.collection('users-booking').updateOne({ _id: userId }, { $push: { createdEvents: event._id } }, { session });
  
      if (insertOneResult.insertedCount === 0 || updateOneEvent.modifiedCount === 0 || updateOneUser.modifiedCount === 0) throw new Error('failed to create event');

      await mongo.commitTransaction(session, true);
  
      return { 
        ...eventFound,
        date: new Date(eventFound.date).toISOString(),
        user: findUser.bind(this, userId),
        bookings: findBookings.bind(this, eventFound.bookings)
      };
    } catch (err) {
      logger.error(`{}Events::#createEvent::error executing::error=${utils.common.stringify(APIError(err))}`);
      session === undefined ? undefined : mongo.abortTransaction(session);
      throw err;
    }
  }
};
