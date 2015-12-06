#! /usr/bin/env node

var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var async = require('async');
var _ = require('lodash');

var Structurer = require('./generator/Structurer');
var Injector = require('./generator/Injector');

global.done = function( message ){
	console.log( message || 'Done.' );
	process.exit( -1 );
};

global.forceExit = function( err ){
	console.error( _.isString(err) ? new Error(err) : err );
	process.exit( -1 );
};

function printUsage(){
	var content = fs.readFileSync( path.join(__dirname, 'usage.list' ), {encoding: 'utf8'});
	global.forceExit( content );
}
/*
function modifyPackageJSON( modifierJS, json ){
	fs.writeFileSync( json,
		JSON.stringify( _.assign( JSON.parse( fs.readFileSync( json, {encoding: 'utf8'} ) ), require( modifierJS ) ), null, 4 ),
		{encoding: 'utf8'}
	);
}
function extendCode( fns, fPath, type ){
	fns.push(
		function(cb){
			fse.copy( path.join(__dirname, 'lib', 'template', type, 'Start.js'), path.join(fPath, 'Start.js'), { clobber: true }, cb );
		}
	);
	fns.push(
		function(cb){
			modifyPackageJSON( path.join(__dirname, 'lib', 'template', type, 'package.js'), path.join(fPath, 'package.json') );
		}
	);
}
function copyfiles( fPath, options ){
	var fns = [
		function(cb){
			fse.copy( path.join(__dirname, 'lib', 'template', 'code'), fPath, { clobber: !!options.force }, cb );
		}
	];
	if( options.amqp ){
		extendCode( fns, fPath, 'amqp' );
	}
	if( options.nsq ){
		extendCode( fns, fPath, 'nsq' );
	}
	if( options.gulp ){
		fns.push(
			function(cb){
				fse.copy( path.join(__dirname, 'lib', 'template', 'gulp'), fPath, { clobber: !!options.force }, cb );
			}
		);
	}
	async.series( fns, function(err){
		if (err) return console.error(err);
		console.log('Done.');
	} );
}

function createEntity( entity, fPath, options ){
	var entityPath = path.join(__dirname, 'lib', 'template', 'service', 'entity.js');
	var jsPath = path.join(fPath, 'bus', entity + '.js');
	fs.writeFileSync( jsPath,
		fs.readFileSync( entityPath, {encoding: 'utf8'} ).replace( '$$$name$$$', '\'' + entity + '\'' ).replace( '$$$rest$$$', options.rest ? 'true' : 'false' ).replace( '$$$websocket$$$', options.websocket ? 'true' : 'false' ),
		{encoding: 'utf8'}
	);
	console.log('Done.');
}

function createService( name, options ){
}

function createProject( name, options ){
	var fPath = path.join( '.', name);
	if( fs.existsSync( fPath ) ){
		if( options.force && fs.statSync(fPath).isDirectory() ){
			return copyfiles( fPath, options );
		}
		else forceExit('Such file/folder already exists.');
	}

	fse.mkdirs( fPath, function (err) {
		if (err) forceExit(err);
		copyfiles( fPath, options );
	});

	if( options.alice ){
		fse.copy( path.join(__dirname, 'lib', 'template', 'alice'), fPath, { clobber: true }, function(err){
			if(err) forceExit(err);
			done( );
		} );
	}
	else done( );
}

function createMochaCode( options ){
	var config = require('./config');

	return Collector.generateTests( config, options.folder || 'test' );
}

function createCode( codeType, name, options ){
	if( codeType === 'test' ){
		if( options.mocha )
			return createMochaCode( options );
	}
	else if( codeType === 'service' ){
		return createServiceCode( name, process.cwd(), options );
	}
	printUsage();
}

*/

function createStructure( structure, name, options ){
	if( structure === 'project' ){
		return Structurer.createProject( name, options );
	}
	else if( structure === 'entity' ){
		return Structurer.createEntity( name, options );
	}
	else if( structure === 'service' ){
		return Structurer.createService( name, options );
	}
	printUsage();
}

function createCode( codeType, name, options ){
	if( codeType === 'test' ){
		if( options.mocha )
			return Injector.createMochaCode( options );
	}
	printUsage();
}

var optionsAccepted = [ 'alice', 'force', 'gulp', 'mocha', 'folder', 'amqp', 'nsq', 'rest', 'websocket' ];
function readCommand( commands, command ){
	for( var i =0; i<commands.length; ++i ){
		if( commands[i] === command )
			return true;
		if( commands[i].startsWith( command + '=' ) )
			return commands[i].substring( commands[i].indexOf('=') + 1 );
	}
	return false;
}
function collectOptions( commands ){
	var res = {};
	optionsAccepted.forEach(function( option ){
		res[ option ] = readCommand(commands, '--' + option);
	});
	return res;
}
function execute(){
	var commands = process.argv.slice( 2 );
	if( commands.length < 2 ){
		return printUsage();
	}
	var options = collectOptions( commands );
	switch( commands[0] ){
		case 'create':
			return createStructure( commands[1], commands[2], options );
		case 'generate':
			return createCode( commands[1], commands[2], options );
		default:
			return printUsage();
	}
}

execute();
