import sql from 'mssql'
import { logError, logDebug } from '../utility'

let objTableList = [];
let domainTableMapping = {}
let pool;

function generateSPFTableName(prefix, type) {
	return prefix + type;
}
async function populateDomainTableMapping() {
	try {
		let data = await sql.query `
    SELECT o.OBJUID, p.STRVALUE as TABLEPREFIX
    FROM schemaOBJ o, schemarel r, schemaOBJ o1, SCHEMAOBJPR p
    WHERE o.OBJDEFUID like 'SPFDomain'and o.DOMAINUID = r.DOMAINUID2 and o.OBJUID = r.UID2
    AND o1.OBJUID = r.UID1 and o1.DOMAINUID = r.DOMAINUID1
    AND o1.OBID = p.OBJOBID
    AND p.PROPERTYDEFUID = 'SPFTablePrefix'
    AND r.defuid = 'SPFDomainGroupDomain'
    AND o.TERMINATIONDATE = '9999/12/31-23:59:59:999'
    AND o1.TERMINATIONDATE = '9999/12/31-23:59:59:999'
    AND r.TERMINATIONDATE = '9999/12/31-23:59:59:999'
    AND p.TERMINATIONDATE = '9999/12/31-23:59:59:999'
  `;
		if (data && data.recordset && data.recordset.length > 0) {
			domainTableMapping = {};
      let tableSet = new Set();
			data.recordset.forEach((rec) => {
				domainTableMapping[rec.OBJUID] = generateSPFTableName(rec.TABLEPREFIX,'OBJ');
        tableSet.add(domainTableMapping[rec.OBJUID]);
			});
      objTableList = Array.from(tableSet);
		}
	} catch (err) {
		logError(err);
	}

}
async function createPool() {
	if (!pool) {
		try {
			pool = await sql.connect(process.env.sql_conn);
			await populateDomainTableMapping();
		} catch (err) {
			logError(err);
		}
	}
}

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
		let tabSelectLists = objTableList.map((tab) =>
			`select [OBID] ,[DOMAINUID] ,[OBJUID] ,[OBJNAME]
      ,[OBJDEFUID] ,[CONFIG] ,[CREATIONDATE] ,[LASTUPDATED] ,[TERMINATIONDATE] ,[CREATIONUSER]
      ,[TERMINATIONUSER] ,[UNIQUEKEY] ,[CLAIMEDTOCONFIGS] ,[MARKEDFORREMOVAL] ,[DESCRIPTION] 
      from ${tab} where obid = '${id}'
      `);
		let tabSelectUnion = tabSelectLists.join(' union ').trim('union');
		let query = tabSelectUnion;
		let data = await request.query(query);
		return data.recordset;
	} catch (err) {
		logError(err);
	}
}

export async function getRelatedObjByOBIDAndRelDef(id, reldef) {
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
		let query = ` 
    select eo.* 
    from ${startTb} so, datarel r,${endTb} eo
    where so.obid = '${id}'
    and so.objuid = r.${startUid} and so.domainuid = r.${startDomain}
    and eo.objuid = r.${endUid} and eo.domainuid = r.${endDomain}
    `.toString();
		let data = await request.query(query);
		return data.recordset;
	} catch (err) {
		logError(err);
	}
}