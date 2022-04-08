const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const router = require('./routers');
const serializejs = require('serialize-javascript');
const connection = require('./routers/mysqldb');

global.web_util = require('./utils');

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
//设置session
app.use(session({
	secret: 'FzsZdjS0oI_Re4WEphi',
	name: 'newspaper',
	saveUninitialized: true,
	rolling: true,
	resave: false,
	cookie: {
		maxAge: 114514000000,
		expires: Date.now() + 114514000000
	}
}));
//active
app.use((req, res, next) => {
	res.locals.active = req.path.split('/')[1];
	res.locals.req = req;
	res.locals.res = res;
	next();
});
//找到routers文件下的index.js导出的函数,传入app
router(app);

app.listen('8003', function () {
	console.log("Website loaded on port 8003.");
})