'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
const moment = require('moment');
module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

	var clickHandler = new ClickHandler();

	// app.route('/')
	// 	.get(isLoggedIn, function (req, res) {
	// 		res.sendFile(path + '/public/index.html');
	// 	});
	function handlerTime (req, res, next) {
		if (req.url == "/") {
			return next();
		} else {
			console.log(req.params.id)
				let time
				if (Number(req.params.id)) {
					 time = moment.unix(Number(req.params.id))
				} else {
					 time = moment(req.params.id)
				}
				
				let unix = time.format("X")
				console.log(time)
				let natural = time.format('MMMM Do YYYY')
				if (natural ==="Invalid date") {
					res.send({
						unix: null,
						natural: null
					})
					return
				}
				res.send({
					unix: unix,
					natural: natural
				})

		}
	}
	app.route('/')
	  .get((req, res) =>{
	  	res.sendFile(path + '/public/test.html');
	  })
	app.route('/:id')
	  .get(handlerTime, (req, res) =>{
	  	console.log(req.url)
	  	res.sendFile(path + '/public/test.html');
	  })
	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});
	app.route('/api/whoami/')
		.get(function (req, res) {
			console.log(req.headers)
			let ipAddress = req.headers['x-forwarded-for']
			let language = req.headers['accept-language'].split(',')[0]
			let userAgent = req.headers['user-agent']
			res.send({
				ipAddress: ipAddress,
				language: language,
				userAgent: userAgent
			})
		});
	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
};
