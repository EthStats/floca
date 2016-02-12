var path = require('path'),
	fs = require('fs'),
	_ = require('lodash');

var pageRoles = {
	workspace: [ '*' ]
};

module.exports = {
	addJADERendering: function( config, rester, pathToIgnore, harcon ){
		var jadeGlobals = { development: config.development, pretty: config.development };

		var fpath = path.join( process.cwd(), 'src', 'pages' );
		fs.readdir(fpath, function(err, files){
			if( err )
				return console.error( err );
			var pages = [];
			files.forEach(function( file ){
				if( fs.statSync( path.join( fpath, file ) ).isDirectory() )
					pages.push( file );
			});
			pages.forEach( function( dPage ){
				pathToIgnore.push( '/' + dPage + '*' );
				rester.get( { path: '/' + dPage + '/?id', context: '', version: '1.0.0', unprotected: true }, function( request, content, callback ){
					var globals = _.assign( { roles: pageRoles[dPage] || [], user: request.user || {} }, jadeGlobals );
					harcon.simpleIgnite( 'JadeRenderer.render', fpath, dPage, 'views', globals, function(err, result){
						callback( err, err || (result ? result[0] : '') );
					} );
				}, { contentType: 'text/html' } );
			} );
		});
	}
};
