'use strict';

var url = require('url');
var li = require('li');
var _ = require('lodash');
var r = require('rethinkdb');

module.exports = function(config, resources) {
	return {
		create: function(req, res) {
			if(!req.user)
				return res.error(401);

			// only admin can create a cycle
			if(!req.user.admin)
				return res.error(403);

			// validate request against schema
			var err = resources.validator.validate('cycle', req.body, {useDefault: true});
			if(err)
				return res.error({code: 400, message: err});

			resources.db.acquire(function(err, conn) {
				if(err)
					return res.error(err);

				// insert the cycle
				r.table('cycles').insert(req.body, {returnVals: true}).run(conn, function(err, result){
					resources.db.release(conn);

					if(err)
						return res.error(err);

					var cycle = result.new_val;

					return res.send(201, sanitize(cycle, privilige));
				});
			});
		},
		list: function(req, res) {
			if(!req.user)
				return res.error(401);

			// get the cycles from the DB
			var query = r.table('cycles');

			// hide drafts fron non-admin users
			if(!req.user.admin)
				query = query.filter(r.row('status').eq('draft').not());

			resources.db.acquire(function(err, conn) {
				if(err)
					return res.error(err);

				var per_page = parseInt(req.query.per_page, 10) || 50;
				var page = parseInt(req.query.page, 10) || 1;

				r.expr({
					// get the total results count
					total: query.count(),
					// get the results for this page
					cycles: query.skip(per_page * (page - 1)).limit(per_page).coerceTo('array')
				}).run(conn, function(err, results){
					resources.db.release(conn);

					if(err)
						return res.error(err);

					var links = {};
					var cycles = results.cycles;
					var pages = Math.ceil(results.total / per_page);

					function buildLink(query){
						return url.format({
							// protocol: req.protocol,
							// host: req.host,
							pathname: req.path,
							query: _.extend({}, req.query, query),
						});
					}

					// add links
					links.first = buildLink({page: 1, per_page: per_page});
					if(page && page != 1) links.prev = buildLink({page: page - 1, per_page: per_page});
					if(!page || page < pages) links.next = buildLink({page: page + 1, per_page: per_page});
					links.last = buildLink({page: pages, per_page: per_page});

					res.set('Link', li.stringify(links));
					res.send(cycles);
				});
			});
		},
		show: function(req, res) {
			if(!req.user)
				return res.error(401);

			res.send('{"cool":"bean"}');
		},
		update: function(req, res) {
			if(!req.user)
				return res.error(401);

			res.send('{"cool":"bean"}');
		},
		destroy: function(req, res) {
			if(!req.user)
				return res.error(401);

			res.send('{"cool":"bean"}');
		}
	};
}