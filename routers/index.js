const Register = require('./register');
const Login = require('./login');
const Article = require('./article');
const connection = require('./mysqldb');
const Api = require('./api');
const url = require("url");
const fs = require("fs");

module.exports = async (app) => {
	// 路由挂载
	// 首页
	
	async function encode(str) {
		let temp = str.replace(/\'/g,"&#39;");
		temp = temp.replace(/\"/g,"&quot;");
		return temp;
	}

	async function decode(str) {
		let temp = str.replace(/&#39;/g,"\'");
		temp = temp.replace(/&quot;/g,"\"");
		return temp;
	}

	app.get('/', async (req, res) => {
		try {
			res.locals.user = req.session.user;
			let page = parseInt(req.query.page || 1);// 页码
			const len = 6;
			let start = (page - 1) * len;
			connection.query(`SELECT * FROM article ORDER BY article.create_time DESC`, async (error, results, fields) => {
				let L = results.length;
				let paginate = { currPage: page, pageCnt: Math.ceil(L / len)};
				if (error) throw error;
				let arr = [], end = Math.min(start + len, L);
				for (let i = start; i < end; ++i) {
					results[i].title = await decode(results[i].title);
					results[i].description = await decode(results[i].description);
					arr.push(results[i]);
				}
				
				res.render("index", {
					articles: arr,
					paginate: paginate
				});
			})
		} catch (e) {
			console.warn(e);
			// res.render('error', { err: e });
		}
	});

	app.get('/archives', async (req, res) => {
		try {
			res.locals.user = req.session.user;
			connection.query(`SELECT * FROM article ORDER BY article.create_time DESC`, async (error, results, fields) => {
				if (error) throw error;
				await results.forEachAsync(async ar => {
					ar.title = await decode(ar.title);
				});
				res.render("archives", { articles: results });
			})
		} catch (e) {
			console.warn(e);
			// res.render('error', { err: e });
		}
	});

	app.use('/registerPage', Register);
	app.use('/loginPage', Login);
	app.use('/article', Article);
	app.use('/api', Api);
}