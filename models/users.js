/* node_modules */
const J = require('joi');
const JObjectId = require('joi-mongodb-objectid')
const { ObjectID } = require('mongodb')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/* libraries */
const { utils } = require('../lib/utils');
const { mongo } = require('../lib/mongo');

/* models */
const { eventSchema } = require('./events');
const { bookingSchema } = require('./bookings');

const Joi = J.extend(JObjectId)

const userSchema = {
  _id: Joi.objectId(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  createdEvents: Joi.alternatives(
      Joi.array().items(Joi.objectId()),
      Joi.array().items(Joi.object(eventSchema))
    ).required(),
  bookedEvents: Joi.alternatives(
      Joi.array().items(Joi.objectId()),
      Joi.array().items(Joi.object(bookingSchema))
    ).required()
};

const userAuthorizationSchema = {
  userId: Joi.objectId().required(),
  token: Joi.string().required(),
  tokenExpiration: Joi.number().required()
};

const userAuthorizationTokenSchema = {
  userId: Joi.objectId().required(),
  email: Joi.string().required()
};

const User = {
  create: async (object, validate = false) => {

    try {
      if (validate) {
        await utils.joi.validate(object, userSchema)
      }
  
      const user = Object.assign({}, { _id: new ObjectID() }, object);
  
      return { ...user };
    } catch (err) {
      throw err;
    }
  },
  searchOne: async (criteria) => {
    try {
      const database = await mongo.getDatabase('test');
      const user = await database.collection('users-booking').findOne({ ...criteria });
      return user;
    } catch (err) {
      throw err;
    }
  },
  findOne: async (userId) => {
    try {
      const database = await mongo.getDatabase('test');
      const user = await database.collection('users-booking').findOne({ _id: userId });
      return user;
    } catch (err) {
      throw err;
    }
  },
  insertOne: async (user, session = undefined) => {
    try {
      const opts = { session: session === undefined ? undefined : session };
      const database = await mongo.getDatabase('test');
      const insertOneResult = await database.collection('users-booking').insertOne(user, opts);
      return insertOneResult;
    } catch (err) {
      throw err;
    }
  },
  findOneAndUpdate: async (userId, payload, session = undefined) => {
    try {
      const opts = { session: session === undefined ? undefined : session };
      const database = await mongo.getDatabase('test');
      const findOneAndUpdateResult = await database.collection('users-booking').findOneAndUpdate({ _id: userId }, payload, opts);
      return findOneAndUpdateResult;
    } catch (err) {
      throw err;
    }
  },
  updateOne: async (userId, payload, session = undefined) => {
    try {
      const opts = { session: session === undefined ? undefined : session };
      const database = await mongo.getDatabase('test');
      const updateOneResult = await database.collection('users-booking').updateOne({ _id: userId }, payload, opts);
      return updateOneResult;
    } catch (err) {
      throw err;
    }
  }
};

const Users = {
  create: async (objects, validate = false) => {
    try {
      const tasks = objects.map(async (obj) => {
        try {
          const user = await User.create(obj, validate);
          return user;
        } catch (er) {
          throw er;
        }
      });
  
      const users = await Promise.all(tasks);
  
      return users;
    } catch (err) {
      throw err;
    }
  },
  findAll: async () => {
    try {
      const database = await mongo.getDatabase('test');
      const users = await database.collection('users-booking').find({}).toArray();
      return users;
    } catch (err) {
      throw err;
    }
  }
};

const UserAuthorization = {
  create: async (object, validate = false) => {
    try {
      if (validate) {
        await utils.joi.validate(object, userAuthorizationSchema)
      }
  
      const userAuthorization = Object.assign({}, object);
  
      return { ...userAuthorization };
    } catch (err) {
      throw err;
    }
  },
  comparePassword: async (password, hashedPassword) => {
    try {
      const match = await bcrypt.compare(password, hashedPassword).catch(err => {
        throw new Error('failed compare password');
      });

      if (!match) {
        throw new Error('invalid credentials');
      }

      return;
    } catch (err) {
      throw err;
    }
  }
}

const UserAuthorizationToken = {
  create: async (object, validate = false) => {
    try {
      if (validate) {
        await utils.joi.validate(object, userAuthorizationTokenSchema)
      }
  
      const userAuthorizationToken = Object.assign({}, object);
  
      return { ...userAuthorizationToken };
    } catch (err) {
      throw err;
    }
  },
  sign: (token, secret) => {
    try {
      const signedToken = jwt.sign(token, secret);
      return signedToken;
    } catch (err) {
      throw err;
    }
  },
}

module.exports = {
  userSchema,
  userAuthorizationTokenSchema,
  userAuthorizationSchema,
  User,
  Users,
  UserAuthorizationToken,
  UserAuthorization
};