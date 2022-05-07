const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const connection = require('./mysqldb');
const url = require("url");
const path = require('path');
//路由对象
let router = express.Router();

//中间件,登录了无法访问注册登录页面
function checklogout(req, res, next) {
	if(req.user) {
		res.redirect('/news/');
	} else {
		next();
	}
}

//注册页面
router.get('/', checklogout, (req, res) => {
	res.redirect('/news/api/error/注册通道已关闭');
	// res.render('register');
})
//注册
router.post('/register', (req, res) => {
	try {
		res.setHeader('Content-Type', 'application/json');
		throw 114514;
		let userInfo = req.body;
		if (!web_util.checkIdChars(userInfo.username)) throw 1001;
		if (userInfo.username.length < 2) throw 1002;
		if (userInfo.username.length > 10) throw 1003;
		if (userInfo.password.length < 6) throw 1004;
		let encryption = crypto.createHmac('sha256', 'jie').update(userInfo.password).digest('hex');
		connection.query(`INSERT into user(username,password) VALUES("${userInfo.username}","${encryption}")`, (error, rows) => {
			if (error) res.send(JSON.stringify({ error_code: 1005 }));
			else {
				res.send(JSON.stringify({ error_code: 1 }));
			}
		});
	} catch (e) {
		console.warn(e);
		res.send(JSON.stringify({ error_code: e }));
	}
})
//导出路由对象
module.exports = router;