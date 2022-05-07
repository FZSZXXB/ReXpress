const express = require('express');
const url = require("url");
const connection = require('./mysqldb');
const fs = require("fs");
const path = require("path");
const multer = require('multer');
const compressing = require('compressing');
//路由对象
let router = express.Router();
// //中间件,未登录不能访问发表文章页面
function checklogin(req, res, next) {
	if (req.user) {
		next();
	} else {
		res.redirect('/loginPage');
	}
}

let upload = multer({
	storage: multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, './tmp/');
		},
		filename: function (req, file, cb) {
			var changedName = (new Date().getTime()) + '-' + file.originalname;
			cb(null, changedName);
		}
	})
});

router.get('/error/:error', (req, res) => {
	try {
		res.render('error', { error: req.params.error });
	} catch (e) {
		console.log(e);
	}
})

router.get('/download/:id/:file', (req, res) => {
	try {
		let id = parseInt(req.params.id);
		let filename = req.params.file;
		if (typeof filename === 'string' && (filename.includes('../'))) res.sendStatus(404);
		fs.access(`./data/${id}/${filename}`, function (err) {
			if (!err) {
				res.download(`./data/${id}/${filename}`, function (error) {
					console.log("Error: ", error)
				});
			} else {
				res.status(404).send(err);
			}
		});
	} catch (e) {
		console.warn(e);
	}
})

router.post('/upload/:id', checklogin, upload.single('file'), (req, res) => {
	try {
		// console.log(222);
		res.setHeader('Content-Type', 'application/json');
		if (!req.file) throw 9001; // 文件未上传

		let id = parseInt(req.params.id);

		if (path.extname(req.file.path) != ".zip") throw 9002; // 文件格式不正确

		compressing.zip.uncompress(req.file.path, `./data/${id}/`).catch(err => {
			console.log(err);
			throw err;
		});
		res.send(JSON.stringify({ error_code: 1 }));
	} catch (e) {
		console.warn(e);
		res.send(JSON.stringify({ error_code: e, detail: e.message }));
	}
})

router.post('/delete/:id/:file', checklogin, (req, res) => {
	try {
		res.setHeader('Content-Type', 'application/json');
		if (typeof req.params.file === 'string' && (req.params.file.includes('../'))) throw 9001; // 危险操作
		let result = fs.unlinkSync(`./data/${req.params.id}/${req.params.file}`);
		if (result != undefined) throw 9002;
		res.send(JSON.stringify({ error_code: 1 }));
	} catch (e) {
		console.warn(e);
		res.send(JSON.stringify({ error_code: e.message }));
	}
})

router.get('/users', (req, res) => {
	try {
		connection.query("SELECT * FROM user", (error, results, fields) => {
			if (error) res.render('error', { error: 'Unknown Error.' });
			res.send({ users: results });
		})
		res.render('error', { error: req.params.error });
	} catch (e) {
		console.log(e);
	}
})
//导出路由对象
module.exports = router;
