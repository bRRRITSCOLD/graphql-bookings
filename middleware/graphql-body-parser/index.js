const gql = require('graphql-tag');

module.exports = (req, res, next) => {
  try {
    if (req.originalUrl === '/graphql?') {
      req.graphql = {};
      req.graphql.params = gql`${req.body.query}`;
    }
    return next();
  } catch (err) {
    return next();
  }
}