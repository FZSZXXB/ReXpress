const Register = require('./register');
const Login = require('./login');
const Article = require('./article');
const connection = require('./mysqldb');
const Api = require('./api');
const url = require("url");
const fs = require("fs");
const { min } = require('moment');

module.exports = function (app) {
	// 路由挂载
	// 首页
	app.get('/', function (req, res) {
		try {
			res.locals.user = req.session.user;
			let page = parseInt(req.query.page || 1);// 页码
			const len = 6;
			let start = (page - 1) * len;
			connection.query(`SELECT * FROM article ORDER BY article.create_time DESC`, function (error, results, fields) {
				let L = results.length;
				let paginate = { currPage: page, pageCnt: Math.ceil(L / len)};
				if (error) throw error;
				let arr = [], end = Math.min(start + len, L);
				for (let i = start; i < end; ++i) arr.push(results[i]);
				
				res.render("index", {
					articles: arr,
					paginate: paginate
				});
			})
		} catch (e) {
			console.log(e);
			// res.render('error', { err: e });
		}
	});

	app.get('/archives', function (req, res) {
		try {
			res.locals.user = req.session.user;
			connection.query(`SELECT * FROM article ORDER BY article.create_time DESC`, function (error, results, fields) {
				if (error) throw error;
				res.render("archives", { articles: results });
			})
		} catch (e) {
			console.log(e);
			// res.render('error', { err: e });
		}
	});

	app.use('/registerPage', Register);
	app.use('/loginPage', Login);
	app.use('/article', Article);
	app.use('/api', Api);
}