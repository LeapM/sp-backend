import { runQuery } from '../dal'
import{logError} from '../utility'

export class Plant {
	constructor(data) {
		this.obid = data.OBID;
		this.objuid = data.OBJUID;
		this.objname = data.OBJNAME;
		this.objdefuid = data.OBJDEFUID;
	}
	static async gen(viewer, id) {
		try {
			let query = `select * from dataobj where obid = '${id}'`.toString();
			const data = await runQuery(query)
			if (data === null || data.lenght == 0) return null;
			const canSee = Plant.checkCanSee(viewer, data);
			return canSee ? new Plant(data[0]) : null;
		} catch (err) {
      logError(err);
			return null;
		}
	}

	static checkCanSee(viewer, data) {
		return true;
	}
}