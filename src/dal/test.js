import sql from 'mssql'
let config = {
	server: "auper1-doc002",
	database: 'SPF16SFData',
	user: 'sa',
	password: 'manager'

}

let pool = new sql.ConnectionPool(config);

export function testConnectPool(times) {
	for (let i = 0; i < times; i++) {
		testConnectUsePool(1).then(() => {});
	}
}

async function testConnectUsePool(times) {
	try {
		if (!pool.connected) {
			await pool.connect();
		}
		for (let i = 0; i < times; i++) {
			let data = await pool.request().query(`select count(*) from schemaobj`);
		}
		console.log(pool.pool.size);
	} catch (err) {}
};
export async function testConnect(times) {
	try {
		for (let i = 0; i < times; i++) {
			await sql.connect(process.env.sql_conn);
			await sql.close();
		}
	} catch (err) {
		console.log(err);
	}
}