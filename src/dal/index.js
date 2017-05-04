import sql from 'mssql'
import{logError,logDebug} from '../utility'
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

export async function getObjByOBID(id) {
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

export async function getRelatedObjByOBIDAndRelDef(id,reldef) {
	try {
    //make sure the database is connected
	  await getPool();
    const request = new sql.Request();
    let startTb = 'dataobj'
    let startUid = 'uid1';
    let startDomain = 'domainuid1';
    let endTb = 'schemaobj'
    let endUid = 'uid2';
    let endDomain = 'domainuid2';
		let query =` 
    select eo.* 
    from ${startTb} so, datarel r,${endTb} eo
    where so.obid = '${id}'
    and so.objuid = r.${startUid} and so.domainuid = r.${startDomain}
    and eo.objuid = r.${endUid} and eo.domainuid = r.${endDomain}
    `.toString();
    logDebug(query);
		let data = await request.query(query);
    logDebug(data);
    return data.recordset;
	} catch (err) {
		logError(err);
	}
}