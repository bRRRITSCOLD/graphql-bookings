/* node_modules */
const J = require('joi');
const JObjectId = require('joi-mongodb-objectid')
const { ObjectID } = require('mongodb')

/* libraries */
const { utils } = require('../lib/utils');
const { mongo } = require('../lib/mongo');

/* models */
const { userSchema } = require('./users');
const { eventSchema } = require('./events');

const Joi = J.extend(JObjectId)

const bookingSchema = {
  _id: Joi.objectId(),
  createdAt: Joi.date().timestamp().required(),
  modifiedAt: Joi.date().timestamp().required(),
  event: Joi.alternatives(
      Joi.objectId(),
      Joi.object(eventSchema)
    ).required(),
  user: Joi.alternatives(
        Joi.objectId(),
        Joi.object(userSchema)
    ).required()
};

const Booking = {
  create: async (object, validate = false) => {

    try {
      if (validate) {
        await utils.joi.validate(object, bookingSchema)
      }
  
      const booking = Object.assign({}, { _id: new ObjectID() }, object);
  
      return { ...booking };
    } catch (err) {
      throw err;
    }
  },
  findOne: async (bookingId) => {
    try {
      const database = await mongo.getDatabase('test');
      const booking = await database.collection('bookings-booking').findOne({ _id: bookingId });
      return booking;
    } catch (err) {
      throw err;
    }
  },
  insertOne: async (booking, session = undefined) => {
    try {
      const opts = { session: session === undefined ? undefined : session };
      const database = await mongo.getDatabase('test');
      const insertOneResult = await database.collection('bookings-booking').insertOne(booking, opts);
      return insertOneResult;
    } catch (err) {
      throw err;
    }
  },
  findOneAndUpdate: async (bookingId, payload) => {
    try {
      const opts = { session: session === undefined ? undefined : session };
      const database = await mongo.getDatabase('test');
      const findOneAndUpdateResult = await database.collection('bookings-booking').findOneAndUpdate({ _id: bookingId }, payload, opts);
      return findOneAndUpdateResult;
    } catch (err) {
      throw err;
    }
  },
  deleteOne: async (bookingId, session) => {
    try {
      const opts = { session: session === undefined ? undefined : session };
      const database = await mongo.getDatabase('test');
      const deleteOneResult = await database.collection('bookings-booking').deleteOne({ _id: bookingId }, opts);
      return deleteOneResult;
    } catch (err) {
      throw err;
    }
  }
};

const Bookings = {
  create: async (objects, validate = false) => {
    try {
      const tasks = objects.map(async (obj) => {
        try {
          const booking = await Booking.create(obj, validate);
          return booking;
        } catch (er) {
          throw er;
        }
      });
  
      const bookings = await Promise.all(tasks);
  
      return bookings;
    } catch (err) {
      throw err;
    }
  },
  findAll: async () => {
    try {
      const database = await mongo.getDatabase('test');
      const bookings = await database.collection('bookings-booking').find({}).toArray();
      return bookings;
    } catch (err) {
      throw err;
    }
  },
  findIn: async (bookingIds) => {
    try {
      const database = await mongo.getDatabase('test');
      const bookings = await database.collection('bookings-booking').find({ _id: { $in: bookingIds } }).toArray();
      return bookings;
    } catch (err) {
      throw err;
    }
  },
};

module.exports = {
  bookingSchema,
  Booking,
  Bookings
};