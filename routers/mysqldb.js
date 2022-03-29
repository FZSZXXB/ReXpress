const mysql = require('mysql');
//配置数据库连接
let connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'newspaper'
});
//连接数据库
connection.getConnection(function (err, connect) {
    if (err)
        console.log(`mysql链接失败${err}`);
});

module.exports = connection;