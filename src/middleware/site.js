import sql from 'mssql';
import { DAL } from '../dal';
import fs from 'fs';
import path from 'path';

let spfSites;
export function addSite(req, res, next) {
	if (global.spfSites && req.body && req.body.site) {
		initialzeDALForSite(req.body.site);
		req.body.site.DAL.pool.connect((err) => {
			if (err) {
				console.log(err);
				return next('fail to connect');
			}
			global.spfSites.push(req.body.site);
			syncSPFSite((err) => {
				if (err) { return next('fail to save'); }
				return res.json({});
			});
		})
	} else {
		next('invalid request');
	}
}

export function getSite(req, res, next) {
	console.log(req.spfSites);
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
		fs.readFile(getDBPath(), (err, data) => {
			if (err) next(err);
			let sites = JSON.parse(data);
			sites.forEach(initialzeDALForSite);
			global.spfSites = sites;
			req.spfSites = sites;
			return next();
		})
	}
}

function getDBPath() {
	return path.join(__dirname, '..', 'db', 'db.json')
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

function syncSPFSite(cb) {
	if (global.spfSites) {
		let sites = global.spfSites.map(site => ({
			name: site.name,
			server: site.server,
			database: site.database,
			user: site.user,
			password: site.password
		}))
		fs.writeFile(getDBPath(), JSON.stringify(sites, null, '    '), cb);
	} else(cb());
}