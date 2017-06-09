import graphviz from 'graphviz';
import path from 'path';
import fs from 'fs';
export const generateDot = (req, res, next) => {
	let g = graphviz.digraph("G");
	let map = {};
	if (req.body && req.body && req.body.steps) {
		let data = req.body;
		console.log(data);
		for (let n of data.steps) {
			if (!map[n.objuid]) {
				map[n.objuid] = g.addNode(n.objname);
			}
		}
		for (let n of data.steps) {
			if (n.successsteps) {
				for (let s of n.successsteps) {
					if (!map[s.objuid]) { map[s.objuid] = g.addNode(s.objuid) };
					g.addEdge(map[n.objuid], map[s.objuid]);
				}
			}
			if (n.failsteps) {
				for (let f of n.failsteps) {
					if (!map[f.objuid]) { map[f.objuid] = g.addNode(f.objuid) };
					g.addEdge(map[f.objuid], map[n.objuid]);
				}
			}
		}

		g.setGraphVizPath(process.env.GRAPHVIZPATH);
		getGraphFolder.then((folder => {
			let file = path.join(folder, data.obid + '.png');
			g.output('png', (graph) => {
				fs.writeFile(file, graph, (err) => {
					if (err) return next('fail to generate');
					return res.json({ path: '/graph/' + data.obid + '.png' });
				});
			});
		})).catch((err) => {
			return next('fail to create folder');
		})
	} else {
		return next('invalid request');
	}
}

let getGraphFolder = new Promise((resolve, reject) => {
	let dir = path.join(__dirname, '..', '..', 'build/graph');
	fs.exists(dir, (exist) => {
		if (exist) {
			resolve(dir)
		} else {
			fs.mkdir(dir, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve(dir);
				}
			});
		}
	})
})