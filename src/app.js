import express from 'express'
import dotenv from 'dotenv'
import graphqlHTTP from 'express-graphql'
import "regenerator-runtime/runtime"
import { queryschema } from './schema'
//import { getPool } from './dal'
import { logError, logDebug } from './utility'
import { getSite, addSite, addSPFSiteToHeader, initializeSiteCollection } from './middleware'
import { testConnect, testConnectPool } from './dal/test'
dotenv.config();
const app = express();
const port = process.env.port || 3000;

//call this one to make sure the sql server connection is established
// getPool()
// 	.then(() => logDebug('connection to sql server established'))
// 	.catch((err) => logError(err));
app.use(initializeSiteCollection);

app.use('/:site/graphql', addSPFSiteToHeader, graphqlHTTP(request => {
	const startTime = Date.now();
	return {
		schema: queryschema,
		graphiql: true,
		extensions({ document, variables, operationName, result }) {
			return { runTime: Date.now() - startTime }
		}
	};
}));

app.get('/api/site', getSite);
app.post('/api/site', addSite);
app.get('/api/test/:times', async(req, res) => {
	const startTime = Date.now();
	await testConnect(req.params.times);
	res.send('total time: ' + (Date.now() - startTime));
});

app.get('/api/testpool/:times', (req, res) => {
	const startTime = Date.now();
	testConnectPool(req.params.times);
	res.send('total time: ' + (Date.now() - startTime));
});

app.get('/', (req, res) => res.send('hello world'));
app.listen(port, () => {
	console.log(`listen on localhost:${port}`);
})