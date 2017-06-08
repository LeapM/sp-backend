import sql from 'mssql'
import { OBJCOLUMN, TERMINATIONDATE } from './constant'
import { logError, logDebug } from '../utility'
import { generateSPFTableName } from './utility'

class DAL {
	constructor(pool) {
		//store all objtable's name for generate union join
		this.objTableList = [];
		//mapping between domain and tableset. When domain is known, select
		this.domainTableMapping = {}
		this.pool = pool;
	}

	getRelTab(obj) {
		let dataTable = this.domainTableMapping[obj.DOMAINUID];
		if (dataTable) {
			return dataTable.replace('OBJ', 'REL');
		} else {
			return null;
		}
	}


	getPropTab(obj) {
		let dataTable = this.domainTableMapping[obj.DOMAINUID];
		if (dataTable) {
			return dataTable.replace('OBJ', 'OBJPR');
		} else {
			return null;
		}
	}

	async init() {
		if (this.objTableList.length == 0) {
			//this should be called before all query function to make sure that domain table is sync
			await this.populateDomainTableMapping();
		}
	}
	async populateDomainTableMapping() {
		try {
			let query = `
    SELECT o.OBJUID, p.STRVALUE as TABLEPREFIX
    FROM schemaOBJ o, schemarel r, schemaOBJ o1, SCHEMAOBJPR p
    WHERE o.OBJDEFUID like 'SPFDomain'and o.DOMAINUID = r.DOMAINUID2 and o.OBJUID = r.UID2
    AND o1.OBJUID = r.UID1 and o1.DOMAINUID = r.DOMAINUID1
    AND o1.OBID = p.OBJOBID
    AND p.PROPERTYDEFUID = 'SPFTablePrefix'
    AND r.defuid = 'SPFDomainGroupDomain'
    AND o.${TERMINATIONDATE}
    AND o1.${TERMINATIONDATE}
    AND r.${TERMINATIONDATE}
    AND p.${TERMINATIONDATE}
  `;

			let data = await this.runQuery(query);
			if (data && data.recordset && data.recordset.length > 0) {
				this.domainTableMapping = {};
				let tableSet = new Set();
				data.recordset.forEach((rec) => {
					this.domainTableMapping[rec.OBJUID] = generateSPFTableName(rec.TABLEPREFIX, 'OBJ');
					tableSet.add(this.domainTableMapping[rec.OBJUID]);
				});
				this.objTableList = Array.from(tableSet);
			}
		} catch (err) {
			logError(err);
		}

	}

	async runQuery(query) {
		try {
			//make sure the database is connected
			if (!this.pool.connected) {
				await this.pool.connect();
				await this.populateDomainTableMapping();
			}
			return await this.pool.request().query(query);
		} catch (err) {
			logError(err);
		}
	}

	async getObjByUIDAndDomain(uid, domain) {
		try {
			await this.init();
			//make sure the database is connected
			let dataTable = this.domainTableMapping[domain];
			if (!dataTable) {
				await this.populateDomainTableMapping();
				dataTable = domainTableMapping[domain];
				if (!dataTable) return null;
			}
			let query = `
			SELECT ${OBJCOLUMN}
			FROM ${dataTable}
			WHERE OBJUID = '${uid}' and DOMAINUID = '${domain}' and ${TERMINATIONDATE}
			`;
			let data = await this.runQuery(query);
			if (data && data.recordset && data.recordset.length === 1) {
				return data.recordset[0];
			} else return null;
		} catch (err) {
			logError(err);
		}
	}
	async getObjByName(name, rest) {
		try {
			//the init should be called everytime before query
			await this.init();
			let dataTable;
			if (rest && rest.domain) {
				dataTable = this.domainTableMapping[rest.domain];
				if (!dataTable) {
					await this.populateDomainTableMapping();
					dataTable = this.domainTableMapping[rest.domain];
					if (!dataTable) return null;
				}
			}
			let whereClause;
			if (rest && rest.domain) {
				whereClause = `WHERE OBJNAME Like '${name}' and DOMAINUID = '${rest.domain}' and ${TERMINATIONDATE}`
			} else {
				whereClause = `WHERE OBJNAME Like '${name}' and ${TERMINATIONDATE}`
			}
			if (rest && rest.classdef) {
				whereClause = `${whereClause} and OBJDEFUID = '${rest.classdef}'`
			}
			let query;
			if (dataTable) {
				query = `
				SELECT ${OBJCOLUMN}
				FROM ${dataTable}
				${whereClause}
		`;
			} else {
				let tabSelectLists = this.objTableList.map((tab) =>
					`SELECT ${OBJCOLUMN}
      FROM ${tab} ${whereClause}
      `);
				let tabSelectUnion = tabSelectLists.join(' union ').trim('union');
				query = tabSelectUnion;
			}
			let data = await this.runQuery(query);
			if (data && data.recordset && data.recordset.length > 0) {
				return data.recordset;
			} else return null;
		} catch (err) {
			logError(err);
		}
	}
	async getPropertyByPropDefUID(obid, propDef) {
		try {
			let sourceObj = await getObjByOBID(obid)
			if (sourceObj) {
				let propTab = getPropTab(sourceObj);
				if (!propTab) return;
				let query = ` 
				SELECT p.STRVALUE, p.CREATIONDATE
				FROM  ${propTab} p 
			  WHERE p.OBJOBID = '${obid}' and p.PROPERTYDEFUID = '${propDef}'
				AND ${TERMINATIONDATE}
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
	async getObjByOBID(id) {
		try {
			//to make sure the getPool is called to fill the objTableList;
			await this.init();
			let tabSelectLists = this.objTableList.map((tab) =>
				`SELECT ${OBJCOLUMN}
      FROM ${tab} where obid = '${id}'
      `);
			let tabSelectUnion = tabSelectLists.join(' union ').trim('union');
			let query = tabSelectUnion;
			let data = await this.runQuery(query);
			if (data && data.recordset && data.recordset.length === 1) {
				return data.recordset[0];
			} else {
				return null;
			}
		} catch (err) {
			logError(err);
		}
	}

	async getRelatedObjByOBIDAndRelDef(id, reldef) {
		try {
			await this.init();
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

			if (reldef.startsWith('-') || reldef.startsWith('+')) {
				reldef = reldef.substring(1);
			}

			let sourceObj = await this.getObjByOBID(id)
			if (sourceObj) {
				let relTab = this.getRelTab(sourceObj);
				if (!relTab) return;
				let query = ` 
				SELECT r.${endUid} AS OBJUID, r.${endDomain} as DOMAINUID 
				FROM  ${relTab} r
			  WHERE r.${startUid} = '${sourceObj.OBJUID}' and r.${startDomain} = '${sourceObj.DOMAINUID}'
				AND r.defuid = '${reldef}'
		`;
				let anotherEndData = await this.runQuery(query);
				if (anotherEndData && anotherEndData.recordset) {
					let result = [];
					for (let i in anotherEndData.recordset) {
						result.push(await this.getObjByUIDAndDomain(anotherEndData.recordset[i].OBJUID,
							anotherEndData.recordset[i].DOMAINUID));
					}
					return result;
				}
			}
		} catch (err) {
			logError(err);

		}
	}
}


export { DAL };