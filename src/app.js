import express from 'express'
import dotenv from 'dotenv'
import graphqlHTTP from 'express-graphql'
import "regenerator-runtime/runtime"
import path from 'path'
import { queryschema } from './schema'
import { getPool } from './dal'
import {logError, logDebug} from './utility'
dotenv.config();
const app = express();
const port = process.env.port || 3000;
//call this one to make sure the sql server connection is established
getPool()
.then(()=>logDebug('connection to sql server established'))
.catch((err)=>logError(err));

app.use('/graphql', graphqlHTTP(request => {
	const startTime = Date.now();
	return {
		schema: queryschema,
		graphiql: true,
		extensions({ document, variables, operationName, result }) {
			return { runTime: Date.now() - startTime }
		}
	};
}));

app.use('/', (req, res) => res.send('hello world'));

app.listen(port, () => {
	console.log(`listen on localhost:${port}`);
})