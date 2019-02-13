const { mongo } = require('./lib/mongo');

const boot = require('./boot');
const { app } = require('./app');

(async () => {
  try {
    await mongo.init('configs/datasources');
    app.listen(3001);
  } catch (err) {
    try {
      await mongo.shutdown();
    } catch (err) {
      undefined;
    }
    boot.killSelf(err);
  }
})();