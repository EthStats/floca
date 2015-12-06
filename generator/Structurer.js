var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');

var _ = require('lodash');
var async = require('async');

function modifyPackageJSON( modifierJS, json ){
	fs.writeFileSync( json,
		JSON.stringify( _.assign( JSON.parse( fs.readFileSync( json, {encoding: 'utf8'} ) ), require( modifierJS ) ), null, 4 ),
		{encoding: 'utf8'}
	);
}
function extendCode( fns, fPath, type ){
	fns.push(
		function(cb){
			fse.copySync( path.join(__dirname, 'template', type, 'Start.js'), path.join(fPath, 'Start.js'), { force: true }, cb );
		}
	);
	fns.push(
		function(cb){
			modifyPackageJSON( path.join(__dirname, 'template', type, 'package.js'), path.join(fPath, 'package.json') );
		}
	);
}

function copyfiles( fPath, options ){
	fse.copySync( path.join(__dirname, 'template', 'base'), fPath, { clobber: !!options.force } );
	if( options.amqp ){
		fse.copySync( path.join(__dirname, 'template', 'amqp', 'Start.js'), path.join(fPath, 'Start.js'), { clobber: true } );
		modifyPackageJSON( path.join(__dirname, 'template', 'amqp', 'package.js'), path.join(fPath, 'package.json') );
	}
	if( options.nsq ){
		fse.copySync( path.join(__dirname, 'template', 'nsq', 'Start.js'), path.join(fPath, 'Start.js'), { clobber: true } );
		modifyPackageJSON( path.join(__dirname, 'template', 'nsq', 'package.js'), path.join(fPath, 'package.json') );
	}
	if( options.gulp ){
		fse.copySync( path.join(__dirname, 'template', 'gulp'), fPath, { clobber: !!options.force } );
	}
}

module.exports = {
	createProject: function( name, options ){
		var fPath = path.join( '.', name);
		if( fs.existsSync( fPath ) ){
			if( options.force && fs.statSync(fPath).isDirectory() ){
				copyfiles( fPath, options );
			}
			else
				global.forceExit('Such file/folder already exists.');
		}
		else{
			fse.mkdirsSync( fPath );
			copyfiles( fPath, options );
		}

		if( options.alice ){
			fse.copySync( path.join(__dirname, 'template', 'alice'), fPath, { clobber: true } );
		}
		global.done( );
	},
	createEntity: function( name, options ){
		var entityPath = path.join(__dirname, 'template', 'service', 'entity.js');
		var jsPath = path.join( process.cwd(), 'bus', name + '.js');
		fs.writeFileSync( jsPath,
			fs.readFileSync( entityPath, {encoding: 'utf8'} ).replace( '$$$name$$$', '\'' + name + '\'' ).replace( '$$$rest$$$', options.rest ? 'true' : 'false' ).replace( '$$$websocket$$$', options.websocket ? 'true' : 'false' ),
			{encoding: 'utf8'}
		);
		console.log('Done.');
	},
	createService: function( name, options ){
		// process.cwd()
	}
};
