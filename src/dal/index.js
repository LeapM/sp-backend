import sql from 'mssql'
import { logError } from '../utility'
let pool;
async function createPool() {
	if (!pool) {
		try {
			pool = await sql.connect(process.env.sql_conn);
		} catch (err) {
			logError(err);
		}
	} }

export async function getPool() {
	return await createPool();
}

export async function runQuery(query) {
	try {
    //make sure the database is connected
	  await getPool();
    const request = new sql.Request();
		let data = await request.query(query);
    return data.recordset;
	} catch (err) {
		logError(err);
	}
}

export async function runQueryByOBID(id) {
	try {
    //make sure the database is connected
	  await getPool();
    const request = new sql.Request();
		let query = `select * from dataobj where obid = '${id}'`.toString();
		let data = await request.query(query);
    return data.recordset;
	} catch (err) {
		logError(err);
	}
}