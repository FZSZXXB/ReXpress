const express = require('express');
const url = require("url");
const connection = require('./mysqldb');
const fs = require("fs");
const path = requre("path");
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
router.get('/pic', function (req, res) {
    try {
        let id = req.query.id;
        let filename = req.query.filename;
        res.download(`./data/${id}/${filename}`, function(error){ 
            console.log("Error: ", error) 
        });
    } catch (e) {
        console.log(e);
    }
})
//导出路由对象
module.exports = router;

/api/pic?id=1&filename="a.png" 