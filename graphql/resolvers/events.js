/* node_modules */
const { ObjectID } = require('mongodb');

/* libraries */
const { mongo } = require('../../lib/mongo');
const { logger } = require('../../lib/logger');
const { utils } = require('../../lib/utils');

/* models */
const { APIError } = require('../../models/errors');
const { Eventt, Eventts } = require('../../models/events');
const { User } = require('../../models/users');

/* shared resolvers */
const { findUser } = require('./shared');

module.exports = {
  events: async () => {
    try {
      const findAllResult = await Eventts.findAll();
  
      const events = await Eventts.create(findAllResult);
  
      return events.map((event) => {
        return { ...event, date: new Date(event.date).toISOString(), user: findUser.bind(this, event.user) }
      }) ;
    } catch (err) {
      logger.error(`{}Events::#events::error executing::error=${utils.common.stringify(APIError(err))}`);
      throw err;
    }
  },
  createEvent: async (args) => {
    let session;

    try {
      const userId = new ObjectID(args.input.user);
  
      let event = await Eventt.create({
        _id: new ObjectID(),
        title: args.input.title,
        description: args.input.description,
        price: +args.input.price,
        date: new Date(args.input.date),
        user: userId,
      }, true);
  
      const userFound = await User.findOne(userId);
  
      if (!userFound) {
        throw new Error('user does not exist');
      }
  
      session = await mongo.getSession('test');

      const insertOneEvent = await Eventt.insertOne(event, session); // database.collection('events-booking').insertOne(event, { session });
      const updateOneUser = await User.updateOne(userId, { $push: { createdEvents: event._id } }, session); // database.collection('users-booking').updateOne({ _id: userId }, { $push: { createdEvents: event._id } }, { session });

      if (insertOneEvent.insertedCount === 0 || updateOneUser.modifiedCount === 0) throw new Error('failed to create event');

      await mongo.commitTransaction(session, true);
  
      return { ...event, date: new Date(event.date).toISOString(), user: findUser.bind(this, userId) };
    } catch (err) {
      logger.error(`{}Events::#createEvent::error executing::error=${utils.common.stringify(APIError(err))}`);
      mongo.abortTransaction(session);
      throw err;
    }
  }
};
