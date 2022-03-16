const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const connection = require('./mysqldb');
const url = require("url");
const path = require('path');
//路由对象
let router = express.Router();
//上传配置
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname,'../', 'public', 'img', 'header'))
    },
    filename: function (req, file, cb) {
        var suffix = file.originalname.split('.')
        cb(null, file.fieldname + '-' + Date.now() + '.' + suffix[suffix.length - 1]);
    }
})
let upload = multer({storage: storage});
//中间件,登录了无法访问注册登录页面
function checklogout(req,res,next){
    if(req.session.user){
        res.redirect('/')
    }else{
        next();
    }
}
//注册页面
router.get('/',checklogout, function (req, res) {
    res.locals.user = req.session.user;
    res.render('register');
})
//注册
router.post('/register', function (req, res) {
    try {
        res.setHeader('Content-Type', 'application/json');
        let userInfo = req.body;
        if (userInfo.username == '' || userInfo.password == '') res.send(JSON.stringify({ error_code: 1001 }));
        let encryption = crypto.createHmac('sha256', 'jie').update(userInfo.password).digest('hex');
        connection.query(`INSERT into user(username,password) VALUES("${userInfo.username}","${encryption}")`, function (error, results, fields) {
            if (error) res.send(JSON.stringify({ error_code: 1001 }));
            else res.send(JSON.stringify({ error_code: 1 }));
        });
    } catch (e) {
        syzoj.log(e);
        res.send(JSON.stringify({ error_code: 1002 }));
    }
})
//导出路由对象
module.exports = router;