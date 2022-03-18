const express = require('express');
const url = require("url");
const connection = require('./mysqldb');
const fs = require("fs-extra");
const path = requre("path");
const multer  = require('multer');
const compressing = require('compressing');
//路由对象
let router = express.Router();
// //中间件,未登录不能访问发表文章页面
// function checklogin(req, res, next) {
//     if (req.session.user) {
//         next();
//     } else {
//         res.redirect('/loginPage');
//     }
// }
//文章内容页面
router.get('/down/:id/:file', function (req, res) {
	try {
		let id = parseInt(req.params.id);
		let filename = req.params.file;
		res.download(`./data/${id}/${filename}`, function (error) { 
			console.log("Error: ", error) 
		});
	} catch (e) {
		console.log(e);
	}
})

function updateFile(id, path) {
	await compressing.zip.uncompress(path, `./data/${id}/`);
}

router.post('/up/:id', app.multer.array('album', 1), function (req, res) {
	try {
		res.setHeader('Content-Type', 'application/json');
		if (!req.session.user) throw 9001; // 未经授权
		if (!req.files['album']) throw 9002; // 无效的文件
		let id = parseInt(req.params.id);
		updateFile(id, req.files['album'][0].path);
		res.send(JSON.stringify({ error_code: 1 }));
	} catch (e) {
		res.send(JSON.stringify({ error_code: e }));
	}
})
//导出路由对象
module.exports = router;