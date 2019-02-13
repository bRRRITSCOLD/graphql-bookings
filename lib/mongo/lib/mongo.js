/* node_modules */
const { MongoClient } = require('mongodb');

/* libraries */
const { logger } = require('../../logger');
const { utils } = require('../../utils');

/* models */
const { APIError } = require('../../../models/errors');

class Mongo {
  constructor () {
    this.datasources = {};
  }

  async client (connectionString, options = {}) {
    try {
      logger.debug(`{}Mongo::#client::initiating execution`);

      const _mongoClient = (cS, o = {}) => {
        return new Promise((resolve, reject) => {
          MongoClient.connect(cS, o, (e, c) => {
            if (e) return reject(e);
            return resolve(c);
          });
        });
      };

      const client = await _mongoClient(connectionString, options);

      logger.info(`{}Mongo::#client::successfully executed`);

      return client;
    } catch (err) {
      const error = APIError(err);
      logger.error(`{}Mongo::#client::error executing::error=${utils.common.stringify(error)}`);
      throw error;
    }
  }

  async connect (config) {
    try {
      logger.debug(`{}Mongo::#connect::initiating execution`);

      this.datasources[config.name] = {};
      this.datasources[config.name].config = config;
      this.datasources[config.name].client = await this.client(this.datasources[config.name].config.connectionString, this.datasources[config.name].config.options);
      this.datasources[config.name].database = this.datasources[this.datasources[config.name].config.name].client.db(config.database);
      this.datasources[config.name].config.connectionInitTime = new Date();

      logger.info(`{}Mongo::#connect::successfully executed`);

      return;
    } catch (err) {
      const error = APIError(err);
      logger.error(`{}Mongo::#connect::error executing::error=${utils.common.stringify(error)}`);
      throw error;

    }
  }

  async init (configPath = undefined) {
    try {
      logger.debug(`{}Mongo::#init::initiating execution`);

      const configs = require(`${process.cwd()}/${configPath}`);

      const tasks = [];

      configs.map((config) => tasks.push(this.connect(config)));

      await Promise.all(tasks);

      logger.info(`{}Mongo::#init::successfully executed`);

      return;
    } catch (err) {
      const error = APIError(err);
      logger.error(`{}Mongo::#init::error executing::error=${utils.common.stringify(error)}`);
      throw error;
    }
  }

  async isConnected (name) {
    try {
      logger.debug(`{}Mongo::#isConnected::initiating execution`);

      let connected = true;

      if (!this.datasources[name].client.isConnected() || !this.datasources[name].client.isConnected({ returnNonCachedInstance: true })) {
        connected = false;
      } else if (!this.datasources[name].client.topology.isConnected() || !this.datasources[name].client.topology.isConnected({ returnNonCachedInstance: true })) {
        connected = false;
      } else if (this.datasources[name].client.topology.isDestroyed() || this.datasources[name].client.topology.isDestroyed({ returnNonCachedInstance: true })) {
        connected = false;
      } else if (!this.datasources[name].database.topology.isConnected() || !this.datasources[name].database.topology.isConnected({ returnNonCachedInstance: true })) {
        connected = false;
      } else if (this.datasources[name].database.topology.isDestroyed() || this.datasources[name].database.topology.isDestroyed({ returnNonCachedInstance: true })) {
        connected = false;
      } else if (!this.datasources[name].database.serverConfig.isConnected() || !this.datasources[name].database.serverConfig.isConnected({ returnNonCachedInstance: true })) {
        connected = false;
      } else if (this.datasources[name].database.serverConfig.isDestroyed() || this.datasources[name].database.serverConfig.isDestroyed({ returnNonCachedInstance: true })) {
        connected = false;
      }

      logger.info(`{}Mongo::#isConnected::successfully executed`);

      return connected;
    } catch (err) {
      const error = APIError(err);
      logger.error(`{}Mongo::#isConnected::error executing::error=${utils.common.stringify(error)}`);
      throw error;
    }
  }

  async verifyConnection (name) {
    try {
      logger.debug(`{}Mongo::#verifyConnection::initiating execution`);

      if (await !this.isConnected(name)) {
        await this.connect(this.datasources[name].config);
      }

      logger.info(`{}Mongo::#verifyConnection::successfully executed`);

      return;
    } catch (err) {
      const error = APIError(err);
      logger.error(`{}Mongo::#verifyConnection::error executing::error=${utils.common.stringify(error)}`);
      throw error;
    }
  }

  async getDatabase(name) {
    try {
      logger.debug(`{}Mongo::#getDatabase::initiating execution`);

      await this.verifyConnection(name);

      const database = this.datasources[name].database;

      logger.info(`{}Mongo::#getDatabase::successfully executed`);

      return database;
    } catch (err) {
      const error = APIError(err);
      logger.error(`{}Mongo::#getDatabase::error executing::error=${utils.common.stringify(error)}`);
      throw error;
    }
  }

  async getClient(name) {
    try {
      logger.debug(`{}Mongo::#getClient::initiating execution`);

      await this.verifyConnection(name);

      const database = this.datasources[name].client;

      logger.info(`{}Mongo::#getClient::successfully executed`);

      return database;
    } catch (err) {
      const error = APIError(err);
      logger.error(`{}Mongo::#getClient::error executing::error=${utils.common.stringify(error)}`);
      throw error;
    }
  }

  getConfig(name) {
    return this.datasources[name].config;
  }

  async shutdown() {
    try {
      logger.debug(`{}Mongo::#shutdown::initiating execution`);

      const tasks = Object.keys(this.datasources).map((key) => {
        return (async () => {
          try {
            this.datasources[key].db = undefined;
            await this.datasources[key].client.close();
            return;
          } catch (er) {
            throw er;
          }
        })().catch((e) => {
          logger.error(`{}Mongo::#shutdown::error shutting down connection ${key}::error=${utils.common.stringify(new APIError(e))}`);
        });
      });

      await Promise.all(tasks);

      logger.info(`{}Mongo::#getClient::successfully executed`);

      return;
    } catch (err) {
      const error = APIError(err);
      logger.error(`{}Mongo::#getClient::error executing::error=${utils.common.stringify(error)}`);
      throw error;
    }
  }

  async getSession(name) {
    try {
      logger.debug(`{}Mongo::#getSession::initiating execution`);

      const _session = (c) => {
        return new Promise((resolve, reject) => {
          try {
            const cl = c.startSession();
            return resolve(cl);
          } catch (err) {
            return reject(err);
          }
        });
      };
      
      await this.verifyConnection(name);

      const clientSession = await _session(this.datasources[name].client);

      clientSession.startTransaction({
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' }
      });

      logger.info(`{}Mongo::#getSession::successfully executed`);

      return clientSession;
    } catch (err) {
      const error = APIError(err);
      logger.error(`{}Mongo::#getSession::error executing::error=${utils.common.stringify(error)}`);
      throw error;
    }
  }

  async commitTransaction(session, retry = false) {
    try {
      const result = await session.commitTransaction();
      console.log('Transaction committed.');
      return result;
    } catch (error) {
      if (retry) {
        if (
          error.errorLabels &&
          error.errorLabels.indexOf('UnknownTransactionCommitResult') >= 0
        ) {
          console.log('UnknownTransactionCommitResult, retrying commit operation ...');
          const result = await this.commitTransaction(session);
          console.log('Transaction retry committed.');
          return result;
        } else {
          console.log('Error during commit ...');
          throw error;
        }
      } else {
        console.log('Error during commit ...');
        throw error;
      }
    }
  }

  abortTransaction(session) {
    try {
      logger.debug(`{}Mongo::#abortTransaction::initiating execution`);

      session.abortTransaction();

      logger.info(`{}Mongo::#abortTransaction::successfully executed`);

      return;
    } catch (err) {
      const error = APIError(err);
      logger.error(`{}Mongo::#abortTransaction::error executing::error=${utils.common.stringify(error)}`);
      throw error;
    }
  }
}

module.exports = {
  Mongo
}