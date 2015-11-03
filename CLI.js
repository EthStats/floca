#! /usr/bin/env node

var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');

function printUsage(){
	var content = fs.readFileSync('./usage.list', {encoding: 'utf8'});
	console.error(content);
	process.exit(1);
}
function copyfiles( fPath, forced ){
	fse.copy( path.join(__dirname, 'lib', 'template'), fPath, { clobber: forced }, function (err) {
		if (err) return console.error(err);
		console.error('Done.');
	} );
}

function createProject( name, forced ){
	var fPath = path.join( '.', name);
	if( fs.existsSync( fPath ) ){
		if( forced && fs.statSync(fPath).isDirectory() ){
			return copyfiles( fPath, forced );
		}
		else return console.error('Such file/folder already exists.');
	}

	fse.mkdirs( fPath, function (err) {
		if (err) return console.error(err);
		copyfiles( fPath, forced );
	});
}

function execute(){
	var commands = process.argv.slice( 1 );
	if( commands.length < 2 ){
		return printUsage();
	}

	switch( commands[0] ){
		case 'create':
			return createProject( commands[1], commands[2] === '--force' );
		default:
			return printUsage();
	}
}

execute();
