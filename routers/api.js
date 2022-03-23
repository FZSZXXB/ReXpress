const express = require('express');
const url = require("url");
const MySQL = require('./mysqldb');
const fs = require("fs-extra");
const path = requre("path");
const multer  = require('multer');
const compressing = require('compressing');
//路由对象
let router = express.Router();
// //中间件,未登录不能访问发表文章页面
function checklogin(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/loginPage');
    }
}
//文章内容页面
router.get('/download/:id/:file', function (req, res) {
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

router.post('/upload/:id', checklogin, app.multer.array('album', 1), function (req, res) {
	try {
		res.setHeader('Content-Type', 'application/json');
		if (!req.files['album']) throw 9001; // 文件未上传

		let id = parseInt(req.params.id);
		
		if (path.extname(req.files['album'][0].path) != ".zip") throw 9002; // 文件格式不正确

		compressing.zip.uncompress(req.files['album'][0].path, `./data/${id}/`).then(res => {
			res.send(JSON.stringify({ error_code: 1 }));
		}).catch(err => {
			res.send(JSON.stringify({ error_code: 9009, detail: err }));
		});
	} catch (e) {
		res.send(JSON.stringify({ error_code: e }));
	}
})

router.post('/delete/:id/:file', checklogin, function (req, res) {
	try {
		res.setHeader('Content-Type', 'application/json');
		if (typeof req.params.file === 'string' && (req.params.file.includes('../'))) throw 9001; // 危险操作
		fs.unlink(`./data`, function (err) { 
			if (err) res.send(JSON.stringify({ error_code: 9002, detail: err }));
			// 如果没有错误，则文件已成功删除
			throw 1;
	 });
	} catch (e) {
		res.send(JSON.stringify({ error_code: e }));
	}
})
//导出路由对象
module.exports = router;