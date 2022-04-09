
<p align="center"><img src="./public/img/logo.png" /></p>

## What's This
A modern blog system, which has file uploading system and realtime preview markdown editor(By @luogu-dev's [Markdown*Palletes](https://github.com/luogu-dev/markdown-palettes)).

You can clone the `main` branch. The `server` branch is a customized edition for our server.

The Album Auto Generator is customized for [FZSZ's Sanyechong Magazine Official Website](http://fzsztech.fzsz.net/news/) to show their magazines.

## Init
Ensure you have Node.js (Latest Version) and MySQL installed.

```sh
npm install
```
## Configuration
Open `routers/mysqldb.js` to modify MySQL password.

Login to MySQL console, then
```sql
CREATE DATABASE newspaper;
USE newspaper;
SOURCE newspaper.sql;
```
## Start Preview
```sh
node app.js
```