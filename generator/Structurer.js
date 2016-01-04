var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');

var _ = require('lodash');
var async = require('async');

var Sourcer = require('./Sourcer');

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

function validateEntity(entity){
	return entity.name && entity.init && _.isFunction( entity.init );
}

function addServiceToEntity( component, service, entityPath, options ){
	component[ service ] = function( terms, ignite, callback ){
		callback( new Error('To be filled') );
	};
	fs.writeFileSync( entityPath, 'module.exports = ' + Sourcer( component, '\t' ) + ';\n', {encoding: 'utf8'} );
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
			fse.copySync( path.join( __dirname, 'template', 'alice'), fPath, { clobber: true } );
		}
		global.done( );
	},
	createEntity: function( name, options ){
		var entityPath = path.join( __dirname, 'template', 'service', 'entity.js');
		var jsPath = path.join( options.projectFolder || process.cwd(), 'bus', name + '.js');
		if( fs.existsSync(jsPath) && !options.force )
			global.forceExit('Such file/folder already exists.');
		fs.writeFileSync( jsPath,
			fs.readFileSync( entityPath, {encoding: 'utf8'} ).replace( '$$$name$$$', '\'' + name + '\'' ).replace( '$$$rest$$$', options.rest ? '\trest: true,' : '' ).replace( '$$$websocket$$$', options.websocket ? '\twebsocket: true,' : '' ),
			{encoding: 'utf8'}
		);
		//if( options.rest || options.websocket ){
		var configPath = path.join( options.projectFolder || process.cwd(), 'config.js' );
		try{
			var config = require( configPath );
			if( options.rest || options.websocket ){
				delete config.server.active;
				config.server.port = 8080;
			}
			else{
				delete config.server.port;
				config.server.active = false;
			}
			fs.writeFileSync( configPath, 'module.exports = ' + Sourcer( config, '\t' ) + ';\n', {encoding: 'utf8'} );
		} catch(err){
			global.forceExit('The config file seems not to be valid.');
		}
		//}
		console.log('Done.');
	},
	createService: function( entity, service, options ){
		try{
			var entityPath = path.join( options.projectFolder || process.cwd(), 'bus', entity.endsWith('.js') ? entity : entity+'.js' );
			var component = require( entityPath );
			if( !validateEntity(component) )
				return global.forceExit('Component does not seem to be a floca entity!', entity);
			addServiceToEntity( component, service, entityPath, options );
		} catch(err){
			console.error( err );
		}
	}
};
