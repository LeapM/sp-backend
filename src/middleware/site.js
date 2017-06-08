import sql from 'mssql';
import { DAL } from '../dal';
import fs from 'fs';
import path from 'path';

let spfSites;
export function addSite(req, res, next) {
	res.send('hell world from site');
}
export function getSite(req, res, next) {
	res.json(req.spfSites);
}

export const addSPFSiteToHeader = (req, res, next) => {
	if (req.params.site) {
		let site = req.spfSites.find((site) => site.name.toUpperCase() === req.params.site.toUpperCase());
		if (site) {
			req.DAL = site.DAL;
			next();
		} else {
			next('invalid spf site');
		}
	} else {
		next('invalid spf site');
	}
}

export const initializeSiteCollection = (req, res, next) => {
	if (global.spfSites) {
		req.spfSites = global.spfSites;
		return next();
	} else {
		fs.readFile(path.join(__dirname, '..', 'db', 'db.json'), (err, data) => {
			if (err) next(err);
			let sites = JSON.parse(data);
			sites.forEach(initialzeDALForSite);
			global.spfSites = sites;
			req.spfSites = sites;
			return next();
		})
	}
}

function initialzeDALForSite(site) {
	let pool = new sql.ConnectionPool({
		server: site.server,
		database: site.database,
		user: site.user,
		password: site.password
	})
	site.DAL = new DAL(pool);
}