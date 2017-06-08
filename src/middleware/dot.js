import graphviz from 'graphviz';
import path from 'path';
import fs from 'fs';
export const generateDot = (req, res, next) => {
	let g = graphviz.digraph("G");
	let map = {};
	console.log(req.body);
	if (req.body && req.body.data && req.body.data.steps) {
		let data = req.body.data;
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
		let file = path.join(__dirname, '..', '..', 'build/graph', data.obid + '.png');
		console.log(file);
		g.output('png', (graph) => {
			fs.writeFile(file, graph, (err) => {
				if (err) return next('fail to generate');
				return res.json({ path: '/graph/' + data.obid + '.png' });
			});
		});
	} else {
		return next('invalid request');
	}
}