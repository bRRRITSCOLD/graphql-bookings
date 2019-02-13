/* node_modules */
const J = require('joi');
const JObjectId = require('joi-mongodb-objectid')
const { ObjectID } = require('mongodb')

/* libraries */
const { utils } = require('../lib/utils');
const { mongo } = require('../lib/mongo');

/* models */
const { userSchema } = require('../models/users');

const Joi = J.extend(JObjectId)

const eventSchema = {
  _id: Joi.objectId(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  date: Joi.date().timestamp().required(),
  user: Joi.alternatives(
      Joi.objectId(),
      Joi.object(userSchema)
    ).required()
};

const Eventt = {
  create: async (object, validate = false) => {
    try {
      if (validate) {
        await utils.joi.validate(object, eventSchema)
      }

      const eventt = Object.assign({}, { _id: new ObjectID() }, object);

      return eventt;
    } catch (err) {
      throw err;
    }
  },
  findOne: async (userId) => {
    try {
      const database = await mongo.getDatabase('test');
      const event = await database.collection('events-booking').findOne({ _id: userId });
      return event;
    } catch (err) {
      throw err;
    }
  },
  insertOne: async (event, session = undefined) => {
    try {
      const opts = { session: session === undefined ? undefined : session };
      const database = await mongo.getDatabase('test');
      const insertOneResult = await database.collection('events-booking').insertOne(event, opts);
      return insertOneResult;
    } catch (err) {
      throw err;
    }
  },
  findOneAndUpdate: async (eventId, payload, session = undefined) => {
    try {
      const opts = { session: session === undefined ? undefined : session };
      const database = await mongo.getDatabase('test');
      const findOneAndUpdateResult = await database.collection('events-booking').findOneAndUpdate({ _id: eventId }, payload, opts);
      return findOneAndUpdateResult;
    } catch (err) {
      throw err;
    }
  },
  updateOne: async (eventId, payload, session = undefined) => {
    try {
      const opts = { session: session === undefined ? undefined : session };
      const database = await mongo.getDatabase('test');
      const updateOneResult = await database.collection('events-booking').updateOne({ _id: eventId }, payload, opts);
      return updateOneResult;
    } catch (err) {
      throw err;
    }
  }
};

const Eventts = {
  create: async (objects, validate = false) => {
    try {
      const tasks = objects.map(async (obj) => {
        try {
          const event = await Eventt.create(obj, validate);
          return event;
        } catch (er) {
          throw er;
        }
      });

      const eventts = await Promise.all(tasks);

      return eventts;
    } catch (err) {
      throw err;
    }
  },
  findIn: async (eventIds) => {
    try {
      const database = await mongo.getDatabase('test');
      const events = await database.collection('events-booking').find({ _id: { $in: eventIds } }).toArray();
      return events;
    } catch (err) {
      throw err;
    }
  },
  findAll: async () => {
    try {
      const database = await mongo.getDatabase('test');
      const events = await database.collection('events-booking').find({}).toArray();
      return events;
    } catch (err) {
      throw err;
    }
  }
};

module.exports = {
  eventSchema,
  Eventt,
  Eventts
};
