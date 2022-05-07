const express = require('express');
const crypto = require('crypto');
const connection = require('./mysqldb');
const jwt = require('express-jwt');
const jwtSign = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

//路由对象
let router = express.Router();

function checklogout(req, res, next) {
	let user = req.user;
	if (user) res.redirect(web_util.makeUrl());
	else next();
}

function setLoginCookie(username, password, res) {
	const token = jwtSign.sign(
		{
			username: username,
			password: password
		},
		JWT_PRIVATE_KEY,
		{ expiresIn: 10 * 365 * 24 * 60 * 60 * 1000 }
	);
	res.cookie('mt_token', token, { maxAge: 10 * 365 * 24 * 60 * 60 * 1000 });
	console.log('Set jwt & login cookie for ' + username + ' ' + JWT_PRIVATE_KEY);
}

router.get('/', checklogout, (req, res) => {

	res.render('login');
})

// Check avaliablity of login. (Just for user.)
router.post('/check', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	try {
		if (!web_util.checkIdChars(req.body.username)) throw 2001;
		let encryption = crypto.createHmac('sha256', 'jie').update(req.body.password).digest('hex');
		connection.query(`select * from user where username = "${req.body.username}" and password = "${encryption}"`, (error, results, fields) => {
			if (error) res.send(JSON.stringify({ error_code: 2002 }));
			if (results.length >= 1) res.send(JSON.stringify({ error_code: 1, encryption: encryption }));
			else res.send(JSON.stringify({ error_code: 2003 }));
		})
	} catch (e) {
		console.warn(e);
		res.send(JSON.stringify({ error_code: e }));
	}
})

// The true login module.
router.post('/login', checklogout, (req, res) => {
	try {
		console.log(`user is ${req.body.username}`);
		if (!web_util.checkIdChars(req.body.username)) throw 'Error: username is illegal.';
		let encryption = crypto.createHmac('sha256', 'jie').update(req.body.password).digest('hex');
		connection.query(`select * from user where username = "${req.body.username}" and password = "${encryption}"`, (error, results, fields) => {
			if (error) throw 'Error: can\'t connect to MySQL';
			if (results.length >= 1) {
				setLoginCookie(results[0].username, results[0].password, res);
				let nex = '';
				if ("undefined" != typeof req.query.nex) nex = req.query.nex;
				res.redirect(web_util.makeUrl([nex]));
			} else {
				throw 'Error: user does not exists.';
			}
		})
	} catch (e) {
		console.warn(e);
	}
})

router.get('/logout', (req, res) => {
	res.clearCookie('mt_token');
	console.log('Cleared cookie');
	res.redirect('/news/loginPage');
})

module.exports = router;