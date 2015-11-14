var http = require('http');
var https = require('https');
var fs = require('fs');

var connect = require('connect'),
	compression = require('compression'),
	bodyParser = require('body-parser');

var Rest = require('connect-rest');
var httphelper = Rest.httphelper();

var Harcon = require('harcon');
var harcon;
var Radiation = require('harcon-radiation');
var radiation;
var Amqp = require('harcon-amqp');
var Nsq = require('harcon-nsq');

var Publisher = require('./Publisher');

var _ = require('lodash');
var jwt = require('jsonwebtoken');
var RestMaker = require('./RestMaker');

var Server = function( config, callback ) {
	this.config = config;

	var self = this;

	self.logger = require('./WinstonLogger').createWinstonLogger( this.config.log, this.config );

	var iopts;
	var amqpAccess = self.config.AMQP_CONN_URL ? { connectURL: self.config.AMQP_CONN_URL } : (self.config.amqp.connectURL ? self.config.amqp : null);
	var nsqAccess = self.config.NSQ_HOST ? { nsqdHost: self.config.NSQ_HOST, nsqdPort: self.config.NSQ_PORT } : (self.config.nsq.nsqdHost ? self.config.nsq : null);
	if( amqpAccess ){
		console.log('Using AMQP...');
		var amqpConfig = { Barrel: Amqp.Barrel, barrel: amqpAccess, logger: self.logger, idLength: 32, name: self.config.NODE_APP_NAME || self.config.entities.appName };
		iopts = _.merge( amqpConfig, self.config.harcon || {} );
	}
	else if( nsqAccess ){
		console.log('Using NSQ...');
		var nsqConfig = { Barrel: Nsq.Barrel, barrel: nsqAccess, logger: self.logger, idLength: 32, name: self.config.NODE_APP_NAME || self.config.entities.appName };
		iopts = _.merge( nsqConfig, self.config.harcon || {} );
	}
	else{
		var normalConfig = { logger: self.logger, idLength: 32, name: self.config.NODE_APP_NAME || self.config.entities.appName };
		iopts = _.merge( normalConfig, self.config.harcon || {} );
	}

	iopts.environment = { httphelper: httphelper };

	harcon = new Harcon( iopts, function(err){
		if( err ) return callback( err );

		var ropts = _.merge( { logger: self.logger }, self.config.radiation || {} );
		radiation = new Radiation( harcon, ropts );

		self.setupTerminationHandlers();

		if( self.config.initer && _.isFunction(self.config.initer) )
			self.config.initer( callback );
		else callback();
	} );
};

var ServerProto = Server.prototype;

ServerProto.setupTerminationHandlers = function(){
	var self = this;

	['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
	'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
	].forEach(function(element) {
		process.on(element, function() { console.log('%s: Node server stopped.', Date(Date.now()), element ); self.close(); });
	});
};

var pathToIgnore = [];
ServerProto.buildUpRest = function( app ){
	var self = this;

	var options = _.merge( {
		context: '/api',
		logger: self.logger,
		discoverPath: 'discover',
		protoPath: 'proto',
		headers: self.originHeaders
	}, self.config.rest || {} );
	if( !self.config.development ){
		delete options.discoverPath; delete options.protoPath;
	}
	var rester = Rest.create( options );

	app.use( radiation.rester( rester ) );

	if( self.config.server.jwt.secret && self.config.server.jwt.acquireURI )
		RestMaker.buildUp( radiation, rester, harcon, { jwt: jwt, jwtConfig: self.config.server.jwt, pathToIgnore: pathToIgnore } );

	if( self.config.extendREST && _.isFunction(self.config.extendREST) ){
		self.config.extendREST( self.config, rester, pathToIgnore, harcon, { jwt: jwt } );
	}
	console.log('Rest services added...');
};

ServerProto.buildUpConnect = function( cookieParser ){
	var self = this;
	var app = connect()
		.use( compression() )
	;

	if( self.config.connectMiddlewares && _.isFunction(self.config.connectMiddlewares) ){
		var middlewares = self.config.connectMiddlewares( ) || [];
		middlewares.forEach( function(middleware){
			app = app.use( middleware );
		} );
	}

	app = app
			.use( bodyParser.urlencoded( { extended: true } ) )
			.use( bodyParser.json() )
	;

	if( self.config.server.jwt.secret )
		app.use( function (req, res, next) {
			if( req.method === 'OPTIONS' )
				return next();

			var ignoring = pathToIgnore.find( function(path){
				if( _.isString( path ) )
					return path.endsWith('*' ) ? (req.url.startsWith( path.substring( 0, path.length-1 ) )) : (path === req.url);
				else if( _.isFunction( path ) )
					return path( req.url );
				else return false;
			} );
			if( ignoring )
				return next();

			var token = req.headers[ self.config.server.jwt.key ] || '';
			jwt.verify(token, self.config.server.jwt.secret, function(err, decoded) {
				if( err ){
					for(var key in self.originHeaders)
						res.setHeader( key, self.originHeaders[key] );
					res.setHeader( 'Content-type', 'text/plain' );
					res.statusCode = 401;
					res.end( 'Invalid or missing token.' );
				}
				else{
					req.user = decoded;
					next( );
				}
			});
		} );

	return app;
};

ServerProto.buildUpHttpsServer = function( sslPort, ipAddress, app ){
	var self = this;

	var sslOptions = {
		key: fs.readFileSync( self.config.server.ssl.key ),
		cert: fs.readFileSync( self.config.server.ssl.cert )
	};

	/*http.createServer( function (req, res) {
		res.writeHead(301, { "Location": "https://" + req.headers.host.split(':')[0] + (self.config.development?':'+sslPort:'') + req.url });
		res.end();
	} );*/
	this.secureServer = https.createServer(sslOptions, app);

	this.secureServer.listen(sslPort, ipAddress, function() {
		console.log('Running on https://'+ipAddress + ':' + sslPort);
	});
};
ServerProto.buildUpHttpServer = function( port, ipAddress, app ){
	this.server = http.createServer( app );

	this.server.listen( port, ipAddress, function() {
		console.log('Running on http://'+ipAddress + ':' + port);
	});
};
ServerProto.buildUpServer = function( ){
	var self = this;

	var app = self.buildUpConnect( );

	var secure = self.config.server.ssl.key;
	var port = self.config.NODE_PORT || self.config.server.port || (secure?443:80);
	var ipAddress = self.config.NODE_IP || self.config.server.ip || '0.0.0.0';

	self.buildUpRest( app );

	if( secure )
		self.buildUpHttpsServer( port, ipAddress, app );
	else
		self.buildUpHttpServer( port, ipAddress, app );
};

ServerProto.serve = function( callback ){
	var self = this;

	var jwtKey = self.config.server.jwt.key || 'x-floca-jwt';
	self.originHeaders ={
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
		'Access-Control-Allow-Headers': 'api-key, x-api-key, ' + jwtKey + ', Accept, Origin, Content-Type',
		'Access-Control-Expose-Headers': jwtKey
	};

	var executer = self.config.initPublisher && _.isFunction(self.config.initPublisher) ? self.config.initPublisher : function(c, p, cb){ cb(); };
	executer( self.config, Publisher, function(err, res){
		if( err ) return callback( err );

		self.buildUpServer( );

		Publisher.addGlobalConfig( self.config );
		harcon.addicts( Publisher );
		Publisher.watch( self.config.entities.folder, -1 );

		if( self.config.development )
			setTimeout( function(){
				console.log( harcon.divisions() );
				console.log( harcon.listeners() );

				if( self.config.runDevelopmentTest && _.isFunction(self.config.runDevelopmentTest) )
					self.config.runDevelopmentTest( harcon );

				console.log( require('util').inspect(process.memoryUsage()) );
			}, 1000 );

		if( callback )
			callback();
	});
};

ServerProto.close = function( callback ){
	var self = this;

	Publisher.close();

	if( this.server )
		this.server.close( function(){ self.server = null; console.log('HTTP stopped'); } );

	if( this.secureServer )
		this.secureServer.close( function(){ self.secureServer = null; console.log('HTTPS stopped'); } );

	if( harcon )
		harcon.close( callback );
	else if( callback )
		callback();

	if( self.config.server.forcefulShutdown )
		setTimeout(
			function(){ process.exit( 1 ); },
			self.config.server.forcefulShutdown
		);
};

module.exports = exports = Server;
