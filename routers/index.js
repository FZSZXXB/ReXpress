const Register = require('./register');
const Login = require('./login');
const Article = require('./article');
const MySQL = require('./mysqldb');
const Api = require('./api');
const url = require("url");
const fs = require("fs");

module.exports = function (app) {
	// 路由挂载
	// 首页
	app.get('/', function (req, res) {
		try {
			res.locals.user = req.session.user;
			MySQL.query(`SELECT * FROM article ORDER BY article.create_time DESC`, function (error, results, fields) {
				if (error) throw error;
				res.render("index", { articles: results });
			})
		} catch (e) {
			console.log(e);
			// res.render('error', { err: e });
		}
	});

	app.get('/archives', function (req, res) {
		try {
			res.locals.user = req.session.user;
			MySQL.query(`SELECT * FROM article ORDER BY article.create_time DESC`, function (error, results, fields) {
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