var fs = require('fs')
var path = require('path')
var _ = require('lodash')

var Structurer = require('./generator/Structurer')
var Injector = require('./generator/Injector')

global.done = function ( message ) {
	console.log( message || 'Done.' )
	process.exit( -1 )
}

global.forceExit = function ( err ) {
	console.error( _.isString(err) ? new Error(err) : err )
	process.exit( -1 )
}

global.printUsage = function printUsage () {
	var content = fs.readFileSync( path.join(__dirname, 'usage.list' ), {encoding: 'utf8'})
	global.forceExit( content )
}

function createStructure ( structure, name, options, commands ) {
	if ( structure === 'project' ) {
		return Structurer.createProject( name, options )
	}
	else if ( structure === 'entity' ) {
		return Structurer.createEntity( name, options )
	}
	else if ( structure === 'service' ) {
		if ( commands.length < 4 ) {
			return global.printUsage()
		}
		return Structurer.createService( name, commands[3], options )
	}
	global.printUsage()
}

function createCode ( codeType, name, options, commands ) {
	if ( codeType === 'test' ) {
		if ( options.mocha )
			return Injector.createMochaCode( options )
	}
	else if ( codeType === 'interaction' ) {
		return Injector.createInteraction( name, commands[3], options )
	}
	global.printUsage()
}

var optionsAccepted = [ 'force', 'gulp', 'mocha', 'folder', 'amqp', 'nsq', 'rest', 'websocket', 'projectFolder', 'entityName', 'appName', 'servicePort', 'web' ]
function readCommand ( commands, command ) {
	for ( var i = 0; i < commands.length; ++i ) {
		if ( commands[i] === command )
			return true
		if ( commands[i].startsWith( command + '=' ) )
			return commands[i].substring( commands[i].indexOf('=') + 1 )
	}
	return false
}
function collectOptions ( commands ) {
	var res = {}
	optionsAccepted.forEach(function ( option ) {
		res[ option ] = readCommand(commands, '--' + option)
	})
	return res
}

module.exports = {
	execute: function ( ) {
		var commands = arguments
		if ( commands.length < 3 ) {
			return global.printUsage()
		}
		var options = collectOptions( commands )
		switch ( commands[0] ) {
		case 'create':
			return createStructure( commands[1], commands[2], options, commands )
		case 'generate':
			return createCode( commands[1], commands[2], options, commands )
		default:
			return global.printUsage()
		}
	}
}
