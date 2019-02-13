/* node_modules */
const { ObjectID } = require('mongodb');
const bcrypt = require('bcryptjs');

/* libraries */
const { mongo } = require('../../lib/mongo');
const { logger } = require('../../lib/logger');
const { utils } = require('../../lib/utils');

/* models */
const { APIError } = require('../../models/errors');
const { User, UserAuthorization, UserAuthorizationToken } = require('../../models/users');

/* shared resolvers */
const { findEvents, findBookings } = require('./shared');

module.exports =   {
  createUser: async (args) => {
    try {
      const password = await bcrypt.hash(args.input.password, 12).catch(err => {
        throw new Error('failed to create user');
      });
  
      let user = await User.create({
        _id: new ObjectID(),
        email: args.input.email,
        password,
        createdEvents: [],
        bookedEvents: []
      }, true);
  
      const database = await mongo.getDatabase('test');
  
      const userFound = await database.collection('users-booking').find({ email: args.input.email }).toArray();
  
      if (userFound.length) {
        throw new Error('user exists');
      }
  
      const result = await database.collection('users-booking').insertOne(user);
  
      if (result.insertedCount === 0) {
        throw new Error('no user created');
      }
  
      return { ...user, password: undefined, createdEvents: findEvents.bind(this, user.createdEvents), bookedEvents: findBookings.bind(this, user.bookedEvents) };
    } catch (err) {
      logger.error(`{}Users::#createUser::error executing::error=${utils.common.stringify(APIError(err))}`);
      throw err;
    }
  },
  login: async ({ email, password }) => {
    try {
      const user = await User.searchOne({ email });
      
      if (!user) {
        throw new Error('invalid credentials');
      }

      await UserAuthorization.comparePassword(password, user.password).catch(err => {
        err.message = err.message === 'failed compare password' ? 'failed to login' : err.message;
        throw err;
      });

      const userAuthorizationToken = await UserAuthorizationToken.create({
        userId: user._id,
        email
      }, true);

      const signedUserAuthorizationToken = UserAuthorizationToken.sign(
        userAuthorizationToken,
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const userAuthorization = await UserAuthorization.create({
        userId: user._id,
        token: signedUserAuthorizationToken,
        tokenExpiration: 1
      }, true);

      return { ...userAuthorization };
    } catch (err) {
      logger.error(`{}Users::#login::error executing::error=${utils.common.stringify(APIError(err))}`);
      throw err;
    }
  }
}