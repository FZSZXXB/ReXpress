const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const connection = require('./mysqldb');
const url = require("url");
const path = require('path');
//路由对象
let router = express.Router();

//中间件,登录了无法访问注册登录页面
async function checklogout(req, res, next) {
	if (req.session.user) {
		res.redirect('/')
	} else {
		next();
	}
}
//注册页面
router.get('/', checklogout, function (req, res) {
	res.locals.user = req.session.user;
	res.render('register');
})
//注册
router.post('/register', function (req, res) {
	try {
		res.setHeader('Content-Type', 'application/json');
		let userInfo = req.body;
		if (!web_util.checkIdChars(userInfo.username)) throw 1001;
		if (userInfo.username.length < 2) throw 1002;
		if (userInfo.username.length > 10) throw 1003;
		if (userInfo.password.length < 6) throw 1004;
		let encryption = crypto.createHmac('sha256', 'jie').update(userInfo.password).digest('hex');
		connection.query(`INSERT into user(username,password) VALUES("${userInfo.username}","${encryption}")`, async (error, results, fields) => {
			if (error) res.send(JSON.stringify({ error_code: 1005 }));
			else res.send(JSON.stringify({ error_code: 1 }));
		});
	} catch (e) {
		console.log(e);
		res.send(JSON.stringify({ error_code: e }));
	}
})
//导出路由对象
module.exports = router;