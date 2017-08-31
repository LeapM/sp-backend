import sql from 'mssql';
import { DAL } from '../dal';
import fs from 'fs';
import path from 'path';

let spfSites;
export function addSite(req, res, next) {
	if (global.spfSites && req.body && req.body.site) {
		console.log(req.body.site);
		initialzeDALForSite(req.body.site);
		req.body.site.DAL.pool.connect((err) => {
			if (err) {
				//_error is general error for redux-form
				console.log(err);
				return res.status(400).json({ _error: "fail to connect to the SPF site" });
			}
			//check if the site exist already
			for (let n in global.spfSites) {
				if (global.spfSites[n].name === req.body.site.name) {
					global.spfSites.splice(n, 1);
					break;
				}
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

export function deleteSite(req, res, next) {
	if (global.spfSites && req.params.site) {
		for (let n in global.spfSites) {
			if (global.spfSites[n].name === req.params.site) {
				global.spfSites.splice(n, 1);
				break;
			}
		}
		syncSPFSite((err) => {
			if (err) { return next('fail to save'); }
			next();
		});
	} else {
		next('invalid request');
	}
}
export function getSite(req, res, next) {
	res.json(formatSPFSite(req.spfSites));
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
	return path.join(__dirname, '..', '..', 'db', 'db.json')
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
		let sites = formatSPFSite(global.spfSites);
		fs.writeFile(getDBPath(), JSON.stringify(sites, null, '    '), cb);
	} else(cb());
}

function formatSPFSite(sites) {
	return sites.map(site => ({
		name: site.name,
		server: site.server,
		database: site.database,
		user: site.user,
		password: site.password
	}))
}