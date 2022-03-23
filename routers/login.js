const express = require('express');
const crypto = require('crypto');
const MySQL = require('./mysqldb');
//路由对象
let router = express.Router();
//中间件,登录了无法访问注册登录页面
function checklogout(req,res,next){
	if(req.session.user){
		res.redirect('/')
	}else{
		next();
	}
}
//登录页面
router.get('/',checklogout, function (req, res) {
	res.locals.user = req.session.user;
	res.render('login');
})
//登录
router.post('/login', function (req, res) {
	try {
		res.setHeader('Content-Type', 'application/json');
		let encryption = crypto.createHmac('sha256', 'jie').update(req.body.password).digest('hex');
		MySQL.query(`select * from user where username = "${req.body.username}" and password = "${encryption}"`, function (error, results, fields) {
			if (error) throw 2001;
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
		syzoj.log(e);
		res.send(JSON.stringify({ error_code: 2002 }));
	}
})
//退出登录
router.post('/logout', function (req, res) {
	req.session.user = '';
	res.redirect('/loginPage');
})
//导出路由对象
module.exports = router;