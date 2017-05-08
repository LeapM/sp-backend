import sql from 'mssql'
import { OBJCOLUMN } from './constant'
import { logError, logDebug } from '../utility'
import { generateSPFTableName } from './utility'

let objTableList = [];
let domainTableMapping = {}
let pool;

function getRelTab(obj) {
	let dataTable = domainTableMapping[obj.DOMAINUID];
	if (dataTable) {
		return dataTable.replace('OBJ', 'REL');
	} else {
		//in case there is new domain table created
		populateDomainTableMapping();
		//rerun the
		let dataTable = domainTableMapping[obj.DOMINUID];
		if (dataTable) {
			return dataTable.replace('OBJ', 'REL');
		} else {
			return null;
		}
	}
}

function getPropTab(obj) {
	let dataTable = domainTableMapping[obj.DOMAINUID];
	if (dataTable) {
		return dataTable.replace('OBJ', 'OBJPR');
	} else {
		//in case there is new domain table created
		populateDomainTableMapping();
		//rerun the
		let dataTable = domainTableMapping[obj.DOMINUID];
		if (dataTable) {
			return dataTable.replace('OBJ', 'OBJPR');
		} else {
			return null;
		}
	}

}
async function populateDomainTableMapping() {
	try {
		let query = `
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

		let data = await runQuery(query);
		if (data && data.recordset && data.recordset.length > 0) {
			domainTableMapping = {};
			let tableSet = new Set();
			data.recordset.forEach((rec) => {
				domainTableMapping[rec.OBJUID] = generateSPFTableName(rec.TABLEPREFIX, 'OBJ');
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
	await createPool();
}

export async function runQuery(query) {
	try {
		//make sure the database is connected
		await getPool();
		const request = new sql.Request();
		return await request.query(query);
	} catch (err) {
		logError(err);
	}
}

export async function getObjByUIDAndDomain(uid, domain) {
	try {
		//make sure the database is connected
		let dataTable = domainTableMapping[domain];
		if (!dataTable) {
			populateDomainTableMapping();
			dataTable = domainTableMapping[domain];
			if (!dataTable) return null;
		}
		let query = `
		SELECT ${OBJCOLUMN}
		FROM ${dataTable}
		WHERE OBJUID = '${uid}' and DOMAINUID = '${domain}' and TERMINATIONDATE = '9999/12/31-23:59:59:999'
		`;
		let data = await runQuery(query);
		if (data && data.recordset && data.recordset.length === 1) {
			return data.recordset[0];
		} else return null;
	} catch (err) {
		logError(err);
	}
}
export async function getPropertyByPropDefUID(obid, propDef) {
	try {
		let sourceObj = await getObjByOBID(obid)
		if (sourceObj) {
			let propTab = getPropTab(sourceObj);
			if (!propTab) return;
			let query = ` 
				SELECT p.STRVALUE, p.CREATIONDATE
				FROM  ${propTab} p 
			  WHERE p.OBJOBID = '${obid}' and p.PROPERTYDEFUID = '${propDef}'
				AND TERMINATIONDATE= '9999/12/31-23:59:59:999'
				`;
			let property = await runQuery(query);
			if (property && property.recordset && property.recordset.length === 1) {
				return property.recordset[0].STRVALUE
			}
		}
	} catch (err) {
		logError(err);
	}
}
export async function getObjByOBID(id) {
	try {
		//to make sure the getPool is called to fill the objTableList;
		await getPool();
		let tabSelectLists = objTableList.map((tab) =>
			`SELECT ${OBJCOLUMN}
      FROM ${tab} where obid = '${id}'
      `);
		let tabSelectUnion = tabSelectLists.join(' union ').trim('union');
		let query = tabSelectUnion;
		let data = await runQuery(query);
		if (data && data.recordset && data.recordset.length === 1) {
			return data.recordset[0];
		} else {
			return null;
		}
	} catch (err) {
		logError(err);
	}
}

export async function getRelatedObjByOBIDAndRelDef(id, reldef) {
	try {
		//make sure the database is connected
		let startUid;
		let startDomain;
		let endUid;
		let endDomain;

		if (reldef.startsWith('-')) {
			startUid = 'uid2';
			startDomain = 'domainuid2';
			endUid = 'uid1';
			endDomain = 'domainuid1';
		} else {
			startUid = 'uid1';
			startDomain = 'domainuid1';
			endUid = 'uid2';
			endDomain = 'domainuid2';
		}
		let sourceObj = await getObjByOBID(id)
		if (sourceObj) {
			let relTab = getRelTab(sourceObj);
			if (!relTab) return;
			let query = ` 
				SELECT r.${endUid} AS OBJUID, r.${endDomain} as DOMAINUID 
				FROM  ${relTab} r
			  WHERE r.${startUid} = '${sourceObj.OBJUID}' and r.${startDomain} = '${sourceObj.DOMAINUID}'
				`;
			let anotherEndData = await runQuery(query);
			if (anotherEndData && anotherEndData.recordset) {
				let result = [];
				for (let i in anotherEndData.recordset) {
					result.push(await getObjByUIDAndDomain(anotherEndData.recordset[i].OBJUID,
						anotherEndData.recordset[i].DOMAINUID));
				}
				return result;
			}
		}
	} catch (err) {
		logError(err);
	}
}
