const express = require('express');
const url = require("url");
const connection = require('./mysqldb');
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
router.get('/', function (req, res) {
    let parseObj = url.parse(req.url, true);
    let articleContent;
    res.locals.user = req.session.user;
    connection.query(`select * from article,user where user.user_id=article.article_user_id and article.article_id=${parseObj.query.id}`, function (error, results, fields) {
        if (results.length == 0) {
            res.send('文章内容已删除');
            return;
        }
        articleContent = results[0];
        articleContent.look_count = articleContent.look_count + 1;
        articleContent.article_post_time = articleContent.article_post_time.toLocaleString();
        connection.query(`UPDATE article set look_count=${articleContent.look_count} where article.article_id = ${articleContent.article_id}`, function (error, results, fields) {
            if (error) throw error;
        })
        connection.query(`select * from comment,user where user.user_id = comment.comment_user_id and comment.comment_article_id = ${articleContent.article_id} ORDER BY comment.comment_post_time DESC`, function (error, results, fields) {
            if (error) throw error;
            for (let i = 0; i < results.length; i++) {
                results[i].comment_post_time = results[i].comment_post_time.toLocaleString();
            }
            res.render('pubContent', {
                article: articleContent,
                comment: results
            });
        })
    })
})
//文章留言
router.post('/comment', function (req, res) {
    connection.query(`INSERT into comment(comment_user_id,comment_post_time,comment_content,comment_article_id) VALUES(${req.session.user.id},FROM_UNIXTIME(${Date.now()}/1000, '%Y-%m-%d %H:%i:%s'),"${req.body.content}",${req.body.articleId})`, function (error, results, fields) {
        if (error) throw error;
        connection.query(`select count(*) count from comment where comment.comment_article_id = ${req.body.articleId}`, function (error, results, fields) {
            if (error) throw error;
            connection.query(`UPDATE article set comment_count=${results[0].count} where article.article_id = ${req.body.articleId}`, function (error, results, fields) {
                if (error) throw error;
                res.redirect(`/pubContent?id=${req.body.articleId}`);
            })
        })
    })
})

//发表文章页面
router.get('/publishPage', checklogin, function (req, res) {
    res.locals.user = req.session.user;
    res.render('publish');
})
//发表文章
router.post('/publish', function (req, res) {
    connection.query(`INSERT into article(article_user_id,article_title,article_content,article_post_time,look_count,comment_count) VALUES(${req.session.user.id},"${req.body.title}","${req.body.content}",FROM_UNIXTIME(${Date.now()}/1000, '%Y-%m-%d %H:%i:%s'),0,0)`, function (error, results, fields) {
        if (error) throw error;
        connection.query(`select article_id from article where article_post_time = (select MAX(article_post_time) FROM article where article_user_id = "${req.session.user.id}")`, function (error, results, fields) {
            if (error) throw error;
            res.redirect(`/pubContent?id=${results[0].article_id}`)
        })
    })
})
//文章编辑
router.post('/editPage', function (req, res) {
    res.locals.user = req.session.user;
    connection.query(`select * from article where article_id=${req.body.article_id}`, function (error, results, fields) {
        if (error) throw error;
        console.log(results);
        res.render('edit', { article: results[0] })
    })
})
//文章编辑发表
router.post('/edit', function (req, res) {
    connection.query(`update article set article_title="${req.body.title}",article_content="${req.body.content}" where article_id=${req.body.article_id}`, function (error, results, fields) {
        if (error) throw error;
        res.redirect(`/pubContent?id=${req.body.article_id}`)
    })
})
//文章删除
router.post('/deleteArticle', function (req, res) {
    console.log(req.body.article_id)
    connection.query(`delete from article where article_id=${req.body.article_id}`, function (error, results, fields) {
        if (error) throw error;
        res.redirect('/')
    })
})
//导出路由对象
module.exports = router;