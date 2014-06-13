'use strict';

var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');

module.exports = function(config){
	return function(req, res, next){
		var app = req.app;

		var resources = {
			db: require('./api/utils/db.js')(config.db)
		};

		// TODO: if DB does not exist, set it up!

		// add middleware
		app.use(config.root + '/api', bodyParser.urlencoded());
		app.use(config.root + '/api', bodyParser.json());
		app.use(config.root + '/api', require('res-error'));
		app.use(config.root + '/api', require('./api/middleware/auth.js')(config.auth, resources));

		// add the endpoints
		fs.readdirSync(__dirname + '/api/endpoints/').forEach(function(file){
		  if(file.indexOf('.js') === (file.length - 3))
		    require(__dirname + '/api/endpoints/' + file)(config, app, resources);
		});

		// TODO: redirect the root

		// TODO: serve angular links

		// TODO: serve components

		// TODO: inject components & dependencies

		// serve static files
		app.use(config.root + '/app', express.static(__dirname + '/app'));
		app.use(config.root + '/files', express.static(__dirname + '/files'));

		next();
	};
};