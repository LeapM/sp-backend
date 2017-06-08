import { logError, logDebug } from '../utility'

export class SPFObj {
	constructor(data) {
		this.obid = data.OBID;
		this.objuid = data.OBJUID;
		this.domainuid = data.DOMAINUID;
		this.objname = data.OBJNAME;
		this.objdefuid = data.OBJDEFUID;
		this.config = data.CONFIG;
		this.creationdate = data.CREATIONDATE;
		this.lastupdated = data.LASTUPDATED;
		this.terminationdate = data.TERMINATIONDATE;
		this.uniquekey = data.UNIQUEKEY;
		this.claimedtoconfigs = data.CLAIMEDTOCONFIGS;
		this.markedforremoval = data.MARKEDFORREMOVAL;
		this.description = data.DESCRIPTION;
		this.spfrevstate = data.SPFREVSTATE;
	}
	isSimpleObj() {
		let classdef = this.objdefuid.toUpperCase();
		return !(classdef.endsWith('VERSION') || classdef.endsWith('REVISION') || classdef.endsWith('MASTER'));
	}
	isDocMaster() {
		let classdef = this.objdefuid.toUpperCase();
		return classdef.endsWith("MASTER");
	}
	isDocRev() {
		let classdef = this.objdefuid.toUpperCase();
		return classdef.endsWith("REVISION");
	}
	isDocVer() {
		let classdef = this.objdefuid.toUpperCase();
		return classdef.endsWith("VERSION");
	}
	async getPropVal(viewer, propdef) {
		try {
			const data = await viwer.DAL.getPropertyByPropDefUID(this.obid, propdef);
			if (!data) return null;
			const canSee = SPFObj.checkCanSee(viewer, data);
			return canSee ? data : null;
		} catch (err) {
			logError(err);
			return null;
		}

	}
	async getRelatedObj(viewer, reldef) {
		try {
			const data = await viewer.DAL.getRelatedObjByOBIDAndRelDef(this.obid, reldef);
			if (!data || data.length == 0) return null;
			const canSee = SPFObj.checkCanSee(viewer, data);
			return canSee ? (() => (
				data.map((rec) => new SPFObj(rec))
			))() : null;
		} catch (err) {
			logError(err);
			return null;
		}
	}
	async getDocRev(viewer, rest) {
		try {
			const docMaster = await this.getDocMaster();
			if (docMaster) {
				const data = await viewer.DAL.getRelatedObjByOBIDAndRelDef(docMaster.obid, 'SPFDocumentRevisions');
				if (!data || data.length === 0) return null;
				const canSee = SPFObj.checkCanSee(viewer, data);
				return canSee ? data.map((rec) => new SPFObj(rec)) : null;
			}

		} catch (err) {
			logError(err);
			return null;
		}
	}
	async getDocMaster(viewer) {
		try {
			if (this.isDocMaster()) {
				return this;
			} else if (this.isDocRev()) {
				const data = await viewer.DAL.getRelatedObjByOBIDAndRelDef(this.obid, '-SPFDocumentRevisions');
				if (!data || data.length === 0) return null;
				const canSee = SPFObj.checkCanSee(viewer, data);
				return canSee ? new SPFObj(data[0]) : null;
			} else if (this.isDocVer()) {
				const revData = await viewer.DAL.getRelatedObjByOBIDAndRelDef(this.obid, '-SPFRevisionVersions');
				if (!revData || revData.length === 0) return null;
				const rev = new SPFObj(revData[0]);
				const data = await viewer.DAL.getRelatedObjByOBIDAndRelDef(rev.obid, '-SPFDocumentRevisions');
				if (!data || data.length === 0) return null;
				const canSee = SPFObj.checkCanSee(viewer, data);
				return canSee ? new SPFObj(data[0]) : null;
			} else {
				return null;
			}

		} catch (err) {
			logError(err);
			return null;
		}
	}
	/*
	 ** static method starts
	 */
	static async gen(viewer, id) {
		try {
			const data = await viewer.DAL.getObjByOBID(id)
			//simulate slow connection
			//await new Promise((resolve)=>(setTimeout(()=>(resolve()),2000)));
			if (!data) return null;
			const canSee = SPFObj.checkCanSee(viewer, data);
			return canSee ? new SPFObj(data) : null;
		} catch (err) {
			logError(err);
			return null;
		}
	}
	static async genByName(viewer, name, rest) {
		try {
			const data = await viewer.DAL.getObjByName(name, rest);
			if (!data || data.lenghth === 0) return null;
			const canSee = SPFObj.checkCanSee(viewer, data);
			return canSee ? (() => (
				data.map((rec) => new SPFObj(rec))
			))() : null;
		} catch (err) {
			logError(err);
			return null;
		}
	}
	static checkCanSee(viewer, data) {
		return true;
	}
}