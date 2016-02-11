var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');

var _ = require('lodash');
var async = require('async');

var beautify = require('js-beautify').js_beautify;
var beautifyConfig = process.env.JS_BEAUTIFY_CONFIG ? require( process.env.JS_BEAUTIFY_CONFIG ) : { indent_size: 4, end_with_newline: true };

var Sourcer = require('./Sourcer');

var tempPathFn = path.join.bind( path, __dirname, 'template' );
var serviceDef = fs.readFileSync( tempPathFn('service', 'service.def'), {encoding: 'utf8'} );

function modifyPackageJSON( modifierJS, json ){
	fs.writeFileSync( json,
		JSON.stringify( _.merge( JSON.parse( fs.readFileSync( json, {encoding: 'utf8'} ) ), require( modifierJS ) ), null, 4 ),
		{encoding: 'utf8'}
	);
}

function validateEntity(entity){
	return entity.name && entity.init && _.isFunction( entity.init );
}

function addServiceToEntity( service, entityPath, options ){
	var entityDef = fs.readFileSync( entityPath, {encoding: 'utf8'} );

	var fnDef = serviceDef.replace('$$$name$$$', service);
	var code = beautify(
		entityDef.substring( 0, entityDef.lastIndexOf('}') ) + fnDef + entityDef.substring( entityDef.lastIndexOf('}') ),
		beautifyConfig
	);
	fs.writeFileSync( entityPath, code, {encoding: 'utf8'} );
}

function copyfiles( fPath, fPathFn, options ){
	fse.copySync( tempPathFn('base'), fPath, { clobber: !!options.force } );
	if( options.amqp ){
		fse.copySync( tempPathFn('amqp', 'Start.js'), fPathFn('Start.js'), { clobber: true } );
		modifyPackageJSON( tempPathFn('amqp', 'package.js'), fPathFn('package.json') );
	}
	if( options.nsq ){
		fse.copySync( tempPathFn('nsq', 'Start.js'), fPathFn('Start.js'), { clobber: true } );
		modifyPackageJSON( tempPathFn('nsq', 'package.js'), fPathFn('package.json') );
	}
	if( options.gulp ){
		var folder = options.web ? 'web' : 'service';
		fse.copySync( tempPathFn('gulp', folder, 'Gulpfile.js' ), fPathFn( 'Gulpfile.js' ), { clobber: !!options.force } );
		fse.copySync( tempPathFn('gulp', folder, 'gulp' ), fPathFn( 'gulp' ), { clobber: !!options.force } );
		modifyPackageJSON( tempPathFn('gulp', folder, 'package.js'), fPathFn('package.json') );
	}
}

module.exports = {
	addEntityName: function( fPathFn, name ){
		var packageFile = fPathFn( 'package.json' );
		fs.writeFileSync( packageFile,
			fs.readFileSync( packageFile, {encoding: 'utf8'} ).replace( /\"name\"\:\s\"ToBeFilled\"/, '\"name\": \"' + name + '\"' ),
			{encoding: 'utf8'}
		);

		var configFile = fPathFn( 'config.js' );
		fs.writeFileSync( configFile,
			fs.readFileSync( configFile, {encoding: 'utf8'} ).replace( /entityName\:\s\'EntityName\'/, 'entityName: \'' + name + '\'' ),
			{encoding: 'utf8'}
		);
	},
	addAppName: function( fPathFn, name ){
		var configFile = fPathFn( 'config.js' );
		fs.writeFileSync( configFile,
			fs.readFileSync( configFile, {encoding: 'utf8'} ).replace( /appName\:\s\'AppName\'/, 'appName: \'' + name + '\'' ),
			{encoding: 'utf8'}
		);
	},
	createProject: function( name, options ){
		var fPath = path.join( options.projectFolder || '.', name);
		var fPathFn = path.join.bind( path, fPath );

		if( fs.existsSync( fPath ) ){
			if( options.force && fs.statSync(fPath).isDirectory() ){
				copyfiles( fPath, fPathFn, options );
			}
			else
				global.forceExit('Such file/folder already exists.');
		}
		else{
			fse.mkdirsSync( fPath );
			copyfiles( fPath, fPathFn, options );
		}

		if( options.alice ){
			fse.copySync( tempPathFn('alice'), fPath, { clobber: true } );
		}

		if( options.web ){
			fse.copySync( tempPathFn('web', 'src'), fPathFn( 'src' ), { clobber: true } );
			fse.copySync( tempPathFn('web', 'bus'), fPathFn( 'bus' ), { clobber: true } );
			fse.copySync( tempPathFn('web', 'providers'), fPathFn( 'providers' ), { clobber: true } );
			fse.copySync( tempPathFn('web', 'config.js'), fPathFn( 'config.js' ), { clobber: true } );
			var configPath = fPathFn( 'config.js' );
			try{
				var config = require( configPath );
				config.server.port = options.servicePort || 8080;
				fs.writeFileSync( configPath, 'module.exports = ' + Sourcer( config, '\t' ) + ';\n', {encoding: 'utf8'} );
			} catch(err){
				global.forceExit('The config file seems not to be valid.');
			}
			modifyPackageJSON( tempPathFn('web', 'package.js'), fPathFn( 'package.json' ) );
		}

		this.addEntityName( fPathFn, name );
		if( options.appName ){
			this.addAppName( fPathFn, options.appName );
		}

		global.done( );
	},
	createEntity: function( name, options ){
		var fPath = options.projectFolder || process.cwd();
		//var fPath = path.join( options.projectFolder || '.', name);
		var fPathFn = path.join.bind( path, fPath );

		var entityPath = tempPathFn('service', 'entity.js');
		var jsPath = path.join( options.projectFolder || process.cwd(), 'bus', name + '.js');
		if( fs.existsSync(jsPath) && !options.force )
			global.forceExit('Such file/folder already exists.');
		fs.writeFileSync( jsPath,
			fs.readFileSync( entityPath, {encoding: 'utf8'} ).replace( '$$$name$$$', '\'' + name + '\'' ).replace( '$$$rest$$$', options.rest ? '\trest: true,' : '' ).replace( '$$$websocket$$$', options.websocket ? '\twebsocket: true,' : '' ),
			{encoding: 'utf8'}
		);
		if( options.rest || options.websocket ){
			var configPath = fPathFn( 'config.js' );
			try{
				var config = require( configPath );
				config.server.active = true;
				fs.writeFileSync( configPath, 'module.exports = ' + Sourcer( config, '\t' ) + ';\n', {encoding: 'utf8'} );
			} catch(err){
				global.forceExit('The config file seems not to be valid.');
			}
		}
		console.log('Done.');
	},
	createService: function( entity, service, options ){
		try{
			var entityPath = path.join( options.projectFolder || process.cwd(), 'bus', entity.endsWith('.js') ? entity : entity+'.js' );
			var component = require( entityPath );
			if( !validateEntity(component) )
				return global.forceExit('Component does not seem to be a floca entity!', entity);
			addServiceToEntity( service, entityPath, options );
			console.log('Done.');
		} catch(err){
			console.error( err );
		}
	}
};
