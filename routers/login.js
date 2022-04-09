const express = require('express');
const crypto = require('crypto');
const connection = require('./mysqldb');
//路由对象
let router = express.Router();
//中间件,登录了无法访问注册登录页面
let checklogout = async (req, res, next) => {
	if(req.session.user) {
		res.redirect('/');
	} else {
		next();
	}
}
//登录页面
router.get('/', checklogout, async (req, res) => {
	res.locals.user = req.session.user;
	res.render('login');
})
//登录
router.post('/login', async (req, res) => {
	try {
		res.setHeader('Content-Type', 'application/json');
		if (!web_util.checkIdChars(req.body.username)) throw 2001;
		let encryption = crypto.createHmac('sha256', 'jie').update(req.body.password).digest('hex');
		connection.query(`select * from user where username = "${req.body.username}" and password = "${encryption}"`, async (error, results, fields) => {
			if (error) throw 2002;
			if (results.length >= 1) {
				req.session.user = {
					id: results[0].user_id,
					username: results[0].username
				}
				res.locals.user = req.session.user;
				res.send(JSON.stringify({ error_code: 1 }));
			} else {
				res.send(JSON.stringify({ error_code: 2001 }));
			}
		})
	} catch (e) {
		console.warn(e);
		res.send(JSON.stringify({ error_code: e }));
	}
})
//退出登录
router.get('/logout', async (req, res) => {
	req.session.user = '';
	res.redirect('/news/loginPage');
})
//导出路由对象
module.exports = router;