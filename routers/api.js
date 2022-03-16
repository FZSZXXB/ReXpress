const express = require('express');
const url = require("url");
const connection = require('./mysqldb');
const fs = require("fs");
const path = requre("path");
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
router.get('/pic', function (req, res) {
    let id = req.query.id;
    let filename = req.query.filename;
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
//导出路由对象
module.exports = router;