var Fuser = require('../Fuser');
var _ = require('lodash');

var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');

var async = require('async');

function start( config, callback ){
	var fuser = new Fuser( config);

	fuser.start( function( err, res ){
		if( err ) return global.forceExit( err );

		callback( null, { fuser: fuser, components: res[1] } );
	} );
}

module.exports = {
	writeComponentTests: function( component, restIT, websocketIT, callback ){
		console.log( component );
		var rest = '';
		var websocket = '';
		component.services.forEach( function(service){
			if( component.rest ){
				rest = rest.concat( '\n' + restIT.replace( '$$$SERVICE$$$', service ).replace( '$$$COMP_NAME$$$', component.name ).replace( '$$$SERVICE_NAME$$$', service ) + '\n' );
			}
			if( component.websocket ){
				websocket = websocket.concat( '\n' + websocketIT.replace( '$$$SERVICE$$$', service ).replace( '$$$DIVISION$$$', component.division ).replace( '$$$COMP_NAME$$$', component.name ).replace( '$$$SERVICE_NAME$$$', service ) + '\n' );
			}
		} );

		callback( null, { rest: rest, websocket: websocket });
	},
	writeTests: function( fPath, components, callback ){
		var self = this;
		var fns = [];

		var templatePath = path.join( __dirname, 'template', 'test' );
		var testFile = fs.readFileSync( path.join( templatePath, 'mocha.template' ), {encoding: 'utf8'} );
		var restIT = fs.readFileSync( path.join( templatePath, 'rest-it.template' ), {encoding: 'utf8'} );
		var websocketIT = fs.readFileSync( path.join( templatePath, 'websocket-it.template' ), {encoding: 'utf8'} );

		var restCode = '', websocketCode = '';
		components.forEach( function(component){
			fns.push( function(cb){
				self.writeComponentTests( component, restIT, websocketIT, function( err, code ){
					if( err ) cb( err );
					restCode = restCode.concat( '\n\n\t\t// Tests for ' + component.name );
					if(code.rest)
						restCode = restCode.concat( code.rest );
					if(code.websocket)
						websocketCode = websocketCode.concat( code.websocket );
					cb();
				} );
			} );
		} );
		async.series( fns, function(err){
			testFile = testFile.replace('$$$REST$$$', restCode).replace('$$$WEBSOCKET$$$', websocketCode);

			fs.writeFileSync( path.join( fPath, 'mochaTest.js' ), testFile, {encoding: 'utf8'} );

			if( callback )
				callback( err );
		} );
	},
	generateTests: function( config, testFolder ){
		var self = this;
		start( config, function(err, res){
			console.log('Server started with the following components:', res.components);
			var fPath = path.join( process.cwd(), testFolder );
			var closer = function(){
				res.fuser.stop( function(){
					console.log('Done.');
				} );
			};
			if( !fs.existsSync( fPath ) )
				fse.mkdirs( fPath, function (err) {
					if( err ) return global.forceExit( err );

					self.writeTests( fPath, res.components, closer );
				});
			else
				self.writeTests( fPath, res.components, closer );
		} );
	}
};
