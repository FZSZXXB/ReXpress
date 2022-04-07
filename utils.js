let util = require('util');
let moment = require('moment');
let url = require('url');
let querystring = require('querystring');

Array.prototype.forEachAsync = Array.prototype.mapAsync = async function (fn) {
  return Promise.all(this.map(fn));
};

Array.prototype.filterAsync = async function (fn) {
  let a = await this.mapAsync(fn);
  return this.filter((x, i) => a[i]);
};

global.ErrorMessage = class ErrorMessage extends Error {
	constructor(message, nextUrls, details) {
		super(message);
		this.nextUrls = nextUrls || {};
		this.details = details;
	}
};

module.exports = {
	checkIdChars(str) {
		let reg = new RegExp('[^a-zA-Z0-9]+');
		return !reg.test(str);
	},
	formatDate(ts, format) {
		if (ts == null) {
			return "Unknown";
		}
		let m = moment(ts * 1000);
		m.locale('eu');
		return m.format(format || 'L');
	},
	formatTime(x) {
		let sgn = x < 0 ? '-' : '';
		x = Math.abs(x);
		function toStringWithPad(x) {
			x = parseInt(x);
			if (x < 10) return '0' + x.toString();
			else return x.toString();
		}
		return sgn + util.format('%s:%s:%s', toStringWithPad(x / 3600), toStringWithPad(x / 60 % 60), toStringWithPad(x % 60));
	},
	parseDate(s) {
		return parseInt(+new Date(s) / 1000);
	},
	getCurrentDate(removeTime) {
		let d = new Date;
		if (removeTime) {
			d.setHours(0);
			d.setMinutes(0);
			d.setSeconds(0);
			d.setMilliseconds(0);
		}
		return parseInt(+d / 1000);
	},
	makeUrl(req_params, form) {
		let res = '';
		if (!req_params) res = '/';
		else if (req_params.originalUrl) {
			let u = url.parse(req_params.originalUrl);
			res = u.pathname;
		} else {
			if (!Array.isArray(req_params)) req_params = [req_params];
			for (let param of req_params) res += '/' + param;
		}
		let encoded = querystring.encode(form);
		if (encoded) res += '?' + encoded;
		return res;
	}
};