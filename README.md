## How to Use
Ensure you have Node.js (Latest Version) and MySQL installed.

```sh
npm install
node app.js
```
## Configuration
Open `routers/mysqldb.js` to modify MySQL password.

Login to MySQL console, then
```sql
CREATE DATABASE newspaper;
USE newspaper;
SOURCE newspaper.sql;
```