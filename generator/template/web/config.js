var serveStatic = require('serve-static'),
	helmet = require('helmet'),
	timeout = require('connect-timeout');

var path = require('path');
var Rester = require('./providers/Rester');

module.exports = {
	floca: {
		appName: 'Nodrium',
		entityName: 'UI'
	},
	server: {
		active: true
	},
	connectMiddlewares: function( config ){
		var wares = [
			timeout( 5000 ),
			// helmet.csp( contentSecurityPolicy ),
			helmet.xframe('deny'),
			// helmet.xssFilter(),
			// helmet.hsts( { includeSubdomains: true }),
			helmet.nosniff(),
			helmet.ienoopen(),
			serveStatic( path.join( process.cwd(), 'www' ) )
		];
		return wares;
	},
	extendREST: function( config, rester, pathToIgnore, harcon, tools ){
		Rester.addJADERendering( config, rester, pathToIgnore, harcon );
	}
};
