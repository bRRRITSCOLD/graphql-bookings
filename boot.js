const { APIError } = require('./models/errors');

module.exports = {
  killSelf: (error) => {
    console.log(`killing self: ${JSON.stringify(APIError(error))}`);
    process.exit(1);
  },
  exit: () => {
    process.exit(0);
  }
}