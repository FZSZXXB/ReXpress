let express = require('express');
let url = require("url");
let MySQL = require('./mysqldb');
let md = require('markdown-it')();
let { kill } = require('process');
//路由对象
let router = express.Router();
//中间件,未登录不能访问发表文章页面
function checklogin(req, res, next) {
	if (req.session.user) {
		next();
	} else {
		res.redirect('/loginPage');
	}
}
//文章内容页面
router.get('/:id/', function (req, res) {
	try {
		res.locals.user = req.session.user;
		let id = parseInt(req.params.id);
		MySQL.query(`SELECT * FROM article WHERE id = ${id}`, function (error, results, fields) {
			if (error)
				res.render('page', { error_code: 4001 });
			else {
				res.render('page', {
					title: results[0].title,
					content: md.render(results[0].content)
				});
			}
		})
	} catch (e) {
		res.render('page', { error_code: 4002 });
	}
})

router.get('/:id/edit', checklogin, function (req, res) {
	try {
		let id = parseInt(req.params.id);
		MySQL.query(`SELECT * FROM article WHERE id = ${id}`, function (error, results, fields) {
			if (results.length === 0) {
				res.render('edit');
			} else {
				res.render('edit', { article: results[0] });
			}
		});
	} catch (e) {
		res.render('edit', { error: e });
	}
})

router.post('/:id/edit', function (req, res) {
	try {
		res.setHeader('Content-Type', 'application/json');
		if (!req.session.user)
			throw 3001; // 未经授权
		else {
			let id = parseInt(req.params.id);
			if (req.body.title.length === 0) throw 3002; // 标题无效
			MySQL.query(`SELECT * FROM article WHERE id = ${id}`, function (error, results, fields) {
				let nowTime = web_util.getCurrentDate(true);
				let description = req.body.description;
				if (results.length === 0) {
					MySQL.query(`INSERT INTO article(title,create_time,update_time,description,content) \
										VALUES("${req.body.title}",${nowTime},${nowTime},"${description}","${req.body.content}")`, function (error, results, fields) {
						if (error)
							res.send(JSON.stringify({ error_code: 3009, detail: error.message }));
						else
							throw 1;
					});
				} else {
					MySQL.query(`UPDATE article SET title="${req.body.title}",update_time=${nowTime},description="${description}",content="${req.body.content}" WHERE id=${id}`, function (error, results, fields) {
						if (error)
							res.send(JSON.stringify({ error_code: 3009, detail: error.message }));
						else
							throw 1;
					});
				}
			});
		}
	} catch (e) {
		res.send(JSON.stringify({ error_code: e }));
	}
})

router.post('/:id/delete', function (req, res) {
	try {
		res.setHeader('Content-Type', 'application/json');
		let id = parseInt(req.params.id);
		MySQL.query(`delete from article where id=${id}`, function (error, results, fields) {
			if (error) throw error.message;
			else {
				fs.unlink(path.join('data', id), function (err) {
					if (err) throw err;
					console.log('File deleted!');
				});
				throw 'ok';
			}
		})
	} catch (e) {
		res.send(JSON.stringify({ error: e }));
	}
})
//导出路由对象
module.exports = router;