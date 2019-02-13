/* node_modules */
const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { express: voyagerMiddleware } = require('graphql-voyager/middleware');
const cors = require('cors');

/* custom middleware */
const securityMiddleware = require('./middleware/security');
const graphqlBodyParser = require('./middleware/graphql-body-parser');

/* graphql */
const rootSchema = require('./graphql/schemas');
const rootResolvers = require('./graphql/resolvers');

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(graphqlBodyParser);

app.use(securityMiddleware)

app.use('/graphql', graphqlHttp({
  schema: rootSchema,
  rootValue: rootResolvers,
  graphiql: process.env.NODE_ENV !== 'PROD'
}));

app.use('/voyager', voyagerMiddleware({
  endpointUrl: '/graphql',
  displayOptions: {
    sortByAlphabet: true,
  },
}));

module.exports = {
  app
};
