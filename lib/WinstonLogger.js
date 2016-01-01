var winston = require('winston');
var loggly = require('winston-loggly');
var _ = require('lodash');

exports.createWinstonLogger = function( options, serverConfig ){
	options = options || {};

	if( options.log && _.isFunction( options.log ) )
		return options;

	if( options.console || serverConfig.LOG_TO_CONSOLE ){
		return new (winston.Logger)({ transports: [ new (winston.transports.Console)({ /*level: 'debug',*/ colorize: 'true' }) ] });
	}

	if( options.exceptionFile )
		winston.handleExceptions(new winston.transports.File({ filename: options.exceptionFile }));
	else
		winston.handleExceptions( new (winston.transports.Console)({ level: 'error', colorize: 'true' }) );
	var transports = [ new (winston.transports.Console)({ level: 'error', colorize: 'true' }) ];

	var tags = [ serverConfig.NODE_APP_NAME || serverConfig.entities.appName, serverConfig.NODE_SERVICE_NAME || serverConfig.entities.serviceName ];
	var logglyAccess = serverConfig.LOGGLY_TOKEN || options.loggly.token;
	if( logglyAccess ){
		transports.push(
			new (winston.transports.Loggly)( {
				token: serverConfig.LOGGLY_TOKEN || options.loggly.token,
				subdomain: serverConfig.LOGGLY_SUBDOMAIN || options.loggly.subdomain,
				tags: tags,
				json: true,
				level: options.level || 'info'
			} )
		);
	}
	else {
		transports.push(
			new (winston.transports.File)( {
				filename: options.file || ('./' + tags[0] + '_' + tags[1] + '.log'),
				level: options.level || 'info',
				maxsize: options.maxSize || 1000000,
				maxFiles: options.maxFiles || 1
			} )
		);
	}

	return new (winston.Logger)({ transports: transports });
};
