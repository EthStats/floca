#! /usr/bin/env node

var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var async = require('async');
var _ = require('lodash');

var Collector = require('./lib/Collector');

global.forceExit = function( err ){
	console.error( err );
	process.exit( -1 );
};

function printUsage(){
	var content = fs.readFileSync( path.join(__dirname, 'usage.list' ), {encoding: 'utf8'});
	global.forceExit( content );
}

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
		console.error('Done.');
	} );
}

function createProject( name, options ){
	var fPath = path.join( '.', name);
	if( fs.existsSync( fPath ) ){
		if( options.force && fs.statSync(fPath).isDirectory() ){
			return copyfiles( fPath, options );
		}
		else return console.error('Such file/folder already exists.');
	}

	fse.mkdirs( fPath, function (err) {
		if (err) return console.error(err);
		copyfiles( fPath, options );
	});
}

function createServiceCode( options ){

}
function createMochaCode( options ){
	var config = require('./config');

	return Collector.generateTests( config, options.folder || 'test' );
}

function createCode( codeType, options ){
	if( codeType === 'test' ){
		if( options.mocha )
			return createMochaCode( options );
	}
	/*else if( codeType === 'service' ){
		return createServiceCode( options );
	}*/
	printUsage();
}

function readCommand( commands, command ){
	for( var i =0; i<commands.length; ++i ){
		if( commands[i] === command )
			return true;
		if( commands[i].startsWith( command + '=' ) )
			return commands[i].substring( commands[i].indexOf('=') + 1 );
	}
	return false;
}

var optionsAccepted = [ 'force', 'gulp', 'mocha', 'folder', 'amqp', 'nsq' ];
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
			return createProject( commands[1], options );
		case 'generate':
			return createCode( commands[1], options );
		default:
			return printUsage();
	}
}

execute();
