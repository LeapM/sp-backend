import { getObjByOBID, getRelatedObjByOBIDAndRelDef} from '../dal'
import{logError,logDebug} from '../utility'

export class SPFObj {
	constructor(data) {
		this.obid = data.OBID;
		this.objuid = data.OBJUID;
		this.domainuid = data.DOMAINUID;
		this.objname = data.OBJNAME;
		this.objdefuid = data.OBJDEFUID;
		this.config= data.CONFIG;
		this.creationdate= data.CREATIONDATE;
		this.lastupdated= data.LASTUPDATED;
		this.terminationdate = data.TERMINATIONDATE;
		this.uniquekey = data.UNIQUEKEY;
		this.claimedtoconfigs= data.CLAIMEDTOCONFIGS;
		this.markedforremoval= data.MARKEDFORREMOVAL;
		this.description= data.DESCRIPTION;
		this.spfrevstate = data.SPFREVSTATE;
	}
	static async gen(viewer, id) {
		try {
			const data = await getObjByOBID(id)
			//simulate slow connection
			//await new Promise((resolve)=>(setTimeout(()=>(resolve()),2000)));
			if (!data || data.lenght == 0) return null;
			const canSee = SPFObj.checkCanSee(viewer, data);
			return canSee ? new SPFObj(data[0]) : null;
		} catch (err) {
      logError(err);
			return null;
		}
	}
	async getRelatedObj(viewer,reldef){
		try{
			const data = await getRelatedObjByOBIDAndRelDef(this.obid,reldef);
			if (!data || data.lenght == 0) return null;
			const canSee = SPFObj.checkCanSee(viewer, data);
			return canSee ? (()=>(
				data.map((rec)=>new SPFObj(rec))
			))() : null;
		}
		catch(err){
			logError(err);
			return null;
		}
	}
	static checkCanSee(viewer, data) {
		return true;
	}
}