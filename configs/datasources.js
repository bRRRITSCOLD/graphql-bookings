const datasources = [
  {
    name: process.env.TODOS_DATABASE,
    database: process.env.TODOS_DATABASE,
    connectionString: `mongodb://${process.env.MONGO_DB_HOST}:${process.env.MONGO_DB_PORT},${process.env.MONGO_DB_HOST}:${+process.env.MONGO_DB_PORT + 1},${process.env.MONGO_DB_HOST}:${+process.env.MONGO_DB_PORT + 2}`,
    options: {
      poolSize: 20,
      keepAlive: true,
      autoReconnect: true,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 15000,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 1000,
      useNewUrlParser: true,
      replicaSet: 'rs'
    }
  }
];

module.exports = datasources;