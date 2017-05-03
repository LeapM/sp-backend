import express from 'express'
import dotenv from 'dotenv'
import graphqlHTTP from 'express-graphql'
import "regenerator-runtime/runtime"
import path from 'path'
import {queryschema} from './schema'

dotenv.config();
const app = express();
const port = process.env.port || 3000;

app.use('/graphql', graphqlHTTP({
  schema: queryschema,
  graphiql: true
}));

app.use('/', (req, res) => res.send('hello world'));

app.listen(port, () => {
  console.log(`listen on localhost:${port}`);
})