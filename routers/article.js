let express = require('express');
let url = require("url");
let connection = require('./mysqldb');
let md = require('markdown-it')();
let fs = require("fs");
let path = require("path");
let { kill } = require('process');
//路由对象
let router = express.Router();
//中间件,未登录不能访问发表文章页面
function checklogin(req, res, next) {
	if (req.user) {
		next();
	} else {
		res.redirect('/news/loginPage');
	}
}

function encode(str) {
	let temp = str.replace(/\'/g,"&#39;");
	temp = temp.replace(/\"/g,"&quot;");
	return temp;
}

function decode(str) {
	let temp = str.replace(/&#39;/g,"\'");
	temp = temp.replace(/&quot;/g,"\"");
	return temp;
}

//文章内容页面
router.get('/:id/', (req, res) => {
	try {
		console.log("Article");
		let id = parseInt(req.params.id);
		connection.query(`SELECT * FROM article WHERE id = ${id}`, (error, results, fields) => {
			if (error)
				res.render('error', { error_code: 4002 });
			else if (results.length > 0) {
				let readTime = results[0].content.length / 400;
				readTime = Math.round(readTime);
				if (readTime < 1) readTime = 1;
				results[0].title =  decode(results[0].title);
				results[0].content =
					md.render( decode(results[0].content))
						.replace('<table>', '<table class="ui very basic unstackable table">')
						.replace(new RegExp('<img src=(.+) alt="">', 'g'), '<a href=$1 class="js_gallery_evaluate" data-fancybox="gallery" data-captain=$1><img src=$1 alt=""></a>');
				res.render('article', {
					readTime: readTime,
					article: results[0]
				});
			} else {
				res.redirect(web_util.makeUrl(['api', 'error', '文章不存在']));
			}
		})
	} catch (e) {
		res.render('error', { error_code: 4002 });
	}
})

function listFiles(id) {
	try {
		let dir = `./data/${id}`;
		let list = fs.readdirSync(dir);
		list.sort((a, b) => parseInt(a) - parseInt(b));
		console.log("Get file list sorted: " + list);
		return list;
	} catch (e) {
		console.warn(e);
		return null;
	}
}

router.get('/:id/edit', checklogin, async (req, res) => {
	try {
		console.log("Edit");
		let id = parseInt(req.params.id);
		let user = req.user;
		console.log("User is " + user.username);
		if (user.username != 'Reqwey' && id === 1) throw '该文章不允许编辑';
		connection.query(`SELECT * FROM article WHERE id = ${id}`, (error, results, fields) => {
			if (results.length === 0) {
				res.render('edit');
			} else {
				let files =  listFiles(id);
				results[0].title =  decode(results[0].title);
				results[0].description =  decode(results[0].description);
				results[0].content =  decode(results[0].content);
				res.render('edit', {
					article: results[0],
					files: files
				});
			}
		});
	} catch (e) {
		res.redirect(web_util.makeUrl(['api', 'error', e]));
	}
})

router.post('/:id/edit', (req, res) => {
	try {
		res.setHeader('Content-Type', 'application/json');
		let user = req.user;
		if (!user)
			throw 3001; // 未经授权
		else {
			let id = parseInt(req.params.id);
			console.log("id = " + id);
			let article = req.body;
			article.title =  encode(article.title);
			article.description =  encode(article.description);
			article.content =  encode(article.content);
			if (article.title.length === 0) throw 3002; // 标题无效
			if (!web_util.checkIdChars(article.music_id)) article.music_id = '';
			if (article.music_server.length >= 1 && article.music_id.length < 1) article.music_server = '';
			connection.query(`SELECT * FROM article WHERE id = ${id}`, (error, results, fields) => {
				let nowTime = web_util.getCurrentDate(true);
				if (results.length === 0) {
					connection.query(`INSERT INTO article(title,create_time,update_time,description,content,music_server,music_id) \
										VALUES("${article.title}",${nowTime},${nowTime},"${article.description}","${article.content}", "${article.music_server}", "${article.music_id}")`, function (error, rows) {
						if (error)
							res.send(JSON.stringify({ error_code: 3009, detail: error.message }));
						else 
							res.send(JSON.stringify({ error_code: 1, article_id: rows.insertId }));
					});
				} else {
					connection.query(`UPDATE article SET title="${article.title}",update_time=${nowTime},description="${article.description}",content="${article.content}",music_server="${article.music_server}",music_id="${article.music_id}" WHERE id=${id}`, function (error, results, fields) {
						if (error)
							res.send(JSON.stringify({ error_code: 3009, detail: error.message }));
						else
						res.send(JSON.stringify({ error_code: 1, article_id: id }));
					});
				}
			});
		}
	} catch (e) {
		res.send(JSON.stringify({ error_code: e }));
	}
})

router.post('/:id/delete', (req, res) => {
	try {
		res.setHeader('Content-Type', 'application/json');
		let user = req.user;
		if (!user)
			throw 'permission denied';
		let id = parseInt(req.params.id);
		connection.query(`delete from article where id=${id}`, function (error, results, fields) {
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