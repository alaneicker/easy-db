import express from 'express';
import cors from 'cors';
import express_graphql from 'express-graphql';
import { buildSchema } from 'graphql';
import typedefs from './typedefs';
import * as rootValue from './resolvers';

const env = process.env.NODE_ENV;
const port = process.env.PORT || 8081;

const app = express();
const schema = buildSchema(typedefs);

app.use(cors());

app.use('/graphql', cors(), express_graphql({
  schema,
  rootValue,
  graphiql: env === 'development',
}));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});