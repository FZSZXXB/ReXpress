const register = require('./register');
const login = require('./login');
const pubContent = require('./pubContent');
const connection = require('./mysqldb');
const url = require("url");
const fs = requir("fs");

module.exports = function (app) {
	// 路由挂载
	// 首页
	app.get('/', function (req, res) {
		try {
			res.locals.user = req.session.user;
			connection.query(`SELECT * FROM newspaper ORDER BY newspaper.time DESC`, function (error, results, fields) {
				if (error) throw error;
				res.render("index", { newspapers: results });
			})
		} catch (e) {
			// res.render('error', { err: e });
		}
	});

	app.get('/newspaper/:id/', function (req, res) {
		try {
			res.locals.user = req.session.user;
			let id = parseInt(req.params.id);
			connection.query(`SELECT * FROM article WHERE id = ${id}`, function (error, results, fields) {
				if (error)
					res.render('page', { error_code: 4001 });
				else {
					res.render('page', {
						title: results[0].title,
						content: results[0].content
					});
				}
			})
		} catch (e) {
			res.render('page', { error_code: 4002 });
		}
	})

	app.post('/newspaper/:id/edit', function (req, res) {
		try {
			res.setHeader('Content-Type', 'application/json');
			if (!req.session.user)
				res.send(JSON.stringify({ error_code: 3001 }));
			else {
				let id = parseInt(req.params.id);
				connection.query(`SELECT * FROM newspaper WHERE id = ${id}`, function (error, results, fields) {
					if (results.length === 0) {
						connection.query(`INSERT INTO newspaper(title,grade,type,time,rating) VALUES("${req.body.title}",${parseInt(req.body.grade)},"${req.body.type}",${web_util.parseDate(req.body.time)},"${req.body.rating.replace('\r\n', '\n')}")`, function (error, results, fields) {
							if (error)
								res.send(JSON.stringify({ error_code: 3002, detail: error.message }));
							else
								res.send(JSON.stringify({ error_code: 1 }));
						});
					} else {
						connection.query(`UPDATE newspaper SET title="${req.body.title}",grade=${req.body.grade},type="${req.body.type}",time=${web_util.parseDate(req.body.time)},rating="${req.body.rating.replace('\r\n', '\n')}" WHERE id=${id}`, function (error, results, fields) {
							if (error)
								res.send(JSON.stringify({ error_code: 3003, detail: error.message }));
							else
								res.send(JSON.stringify({ error_code: 1 }));
						});
					}
				});
			}
		} catch (e) {
			res.send(JSON.stringify({ error_code: 3004 }));
		}
	})

	app.use('/registerPage',register);
	app.use('/loginPage',login);
	app.use('/pubContent',pubContent);
}