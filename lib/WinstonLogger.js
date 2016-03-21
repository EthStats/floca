'use strict'

let winston = require('winston')
require('winston-loggly')
let Papertrail = require('winston-papertrail').Papertrail

let _ = require('isa.js')

let Assigner = require('assign.js')
let assigner = new Assigner()

let path = require('path')
let PROJECT_ROOT = path.join(__dirname, '..', '..')

function getStackInfo (stackIndex) {
	let stacklist = (new Error()).stack.split('\n').slice(3)

	let stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi
	let stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi

	let s = stacklist[stackIndex] || stacklist[0]
	let sp = stackReg.exec(s) || stackReg2.exec(s)

	if (sp && sp.length === 5) {
		return {
			method: sp[1],
			relativePath: path.relative(PROJECT_ROOT, sp[2]),
			line: sp[3],
			pos: sp[4],
			file: path.basename(sp[2]),
			stack: stacklist.join('\n')
		}
	}
}

function formatLogArguments (args) {
	if (_.isString( args[0] )) {
		let stackInfo = getStackInfo(1)
		if ( stackInfo )
			args.push( stackInfo )
	}
	return args
}

exports.createWinstonLogger = function ( options, serverConfig ) {
	options = options || {}

	if ( options.log && _.isFunction( options.log ) )
		return options

	if ( options.console || serverConfig.LOG_TO_CONSOLE ) {
		var consoleConfig = { level: serverConfig.FLOCA_LOG_LEVEL || options.level, colorize: 'true' }
		return new (winston.Logger)({ transports: [ new (winston.transports.Console)( consoleConfig ) ] })
	}

	if ( options.exceptionFile )
		winston.handleExceptions(new winston.transports.File({ filename: options.exceptionFile }))
	else
		winston.handleExceptions( new (winston.transports.Console)({ level: 'error', colorize: 'true' }) )
	let transports = [ new (winston.transports.Console)({ level: 'error', colorize: 'true' }) ]

	let tags = [ serverConfig.NODE_APP_NAME || serverConfig.floca.appName, serverConfig.NODE_ENTITY_NAME || serverConfig.floca.entityName ]
	let logglyAccess = serverConfig.LOGGLY_TOKEN || options.loggly.token
	let papertrailAccess = serverConfig.PAPERTRAIL_HOST || options.papertrail.host
	if ( logglyAccess ) {
		transports.push(
			new (winston.transports.Loggly)(
				assigner.assign( options.loggly || {}, {
					token: serverConfig.LOGGLY_TOKEN || options.loggly.token,
					subdomain: serverConfig.LOGGLY_SUBDOMAIN || options.loggly.subdomain,
					tags: tags,
					json: true,
					level: serverConfig.FLOCA_LOG_LEVEL || options.level || 'info'
				} )
			)
		)
	}
	else if ( papertrailAccess ) {
		transports.push(
			new Papertrail(
				assigner.assign( options.papertrail || {}, {
					host: serverConfig.PAPERTRAIL_HOST || options.papertrail.host,
					port: serverConfig.PAPERTRAIL_PORT || options.papertrail.port,
					level: serverConfig.FLOCA_LOG_LEVEL || options.level || 'info'
				} )
			)
		)
	}
	else {
		transports.push(
			new (winston.transports.File)( {
				filename: options.file || ('./' + tags[0] + '_' + tags[1] + '.log'),
				level: serverConfig.FLOCA_LOG_LEVEL || options.level || 'info',
				maxsize: options.maxSize || 1000000,
				maxFiles: options.maxFiles || 1
			} )
		)
	}

	let logger = new (winston.Logger)({ transports: transports })
	let fns = options.addStackTo || []
	fns.forEach( function ( fnName ) {
		if ( logger[fnName] && _.isFunction(logger[fnName]) ) {
			let legacy = '_' + fnName
			logger[ legacy ] = logger[fnName]
			logger[fnName] = function () {
				logger[legacy].apply(logger, formatLogArguments( Array.prototype.slice.call(arguments) ))
			}
		}
	} )
	return logger
}
