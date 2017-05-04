import { runQueryByOBID } from '../dal'
import{logError} from '../utility'

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
			const data = await runQueryByOBID(id)
			//simulate slow connection
			//await new Promise((resolve)=>(setTimeout(()=>(resolve()),2000)));
			if (data === null || data.lenght == 0) return null;
			const canSee = SPFObj.checkCanSee(viewer, data);
			return canSee ? new SPFObj(data[0]) : null;
		} catch (err) {
      logError(err);
			return null;
		}
	}
	static checkCanSee(viewer, data) {
		return true;
	}
}