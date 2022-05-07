const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const router = require('./routers');
const serializejs = require('serialize-javascript');
const connection = require('./routers/mysqldb');
const jwt = require('express-jwt');
const jwtSign = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

global.JWT_PRIVATE_KEY = 'FzszXxB2022Reqwey';
global.web_util = require('./utils');

process.on('unhandledRejection', (reason, p) => {
	console.log('Promise: ', p, 'Reason: ', reason)
	// do something
});
//创建服务应用
let app = express();
//ejs模板引擎配置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.locals.serializejs = serializejs;
//文件上传
let multer = require('multer');
app.multer = multer({ dest: './tmp' });
//静态路径
app.use(express.static(path.join(__dirname, 'public')));
//上传路径
app.use(bodyParser.json());
//接受req.body参数配置
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Use cookie parser
app.use(require('cookie-parser')());
//active
app.use((req, res, next) => {
	res.locals.active = req.path.split('/')[1];
	next();
});

// login
app.use(jwt({
  secret: JWT_PRIVATE_KEY,
	algorithms: ['HS256'],
  credentialsRequired: false,
  getToken: (req) => req.cookies.mt_token
}));

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    next();
	} else {
		next();
	}
});

app.use((req, res, next) => {
	res.locals.req = req;
	res.locals.res = res;
	res.locals.user = req.user;
	console.log(req.user);
	console.log(req.cookies.mt_token);
	next();
});

//找到routers文件下的index.js导出的函数,传入app
router(app);

app.listen('8003', function () {
	console.log("Website loaded on port 8003.");
})