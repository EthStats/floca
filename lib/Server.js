var http = require('http');
var https = require('https');
var fs = require('fs');

var connect = require('connect'),
	bodyParser = require('body-parser');

var Rest = require('connect-rest');
var httphelper = Rest.httphelper();

var Harcon = require('harcon');
var harcon;
var Radiation = require('harcon-radiation');
var radiation;
var Amqp = require('harcon-amqp');

var Publisher = require('./Publisher');

var _ = require('lodash');

var Server = function( config, callback ) {
	this.config = config;

	var self = this;

	self.logger = require('./WinstonLogger').createWinstonLogger( this.config.log, this.config );

	var amqpConfig = { Barrel: Amqp.Barrel, barrel: self.config.amqp, logger: self.logger, idLength: 32, name: self.config.NODE_APP_NAME || self.config.entities.appName };
	var normalConfig = { logger: self.logger, idLength: 32, name: self.config.NODE_APP_NAME || self.config.entities.appName };

	var iopts;
	if( self.config.amqp ){
		console.log('Using AMQP...');
		iopts = _.merge( amqpConfig, self.config.harcon || {} );
	}
	else
		iopts = _.merge( normalConfig, self.config.harcon || {} );

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

var originHeaders ={
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
	'Access-Control-Allow-Headers': 'api-key, x-api-key, x-warper-jwt, Accept, Origin, Content-Type',
	'Access-Control-Expose-Headers': 'x-warper-jwt'
};
ServerProto.buildUpRest = function( app ){
	var self = this;
	var options = _.merge( {
		context: '/api',
		logger: self.logger,
		discoverPath: 'discover',
		protoPath: 'proto',
		headers: originHeaders
	}, self.config.rest || {} );
	if( !self.config.development ){
		delete options.discoverPath; delete options.protoPath;
	}
	var rester = Rest.create( options );
	if( self.config.extendREST && _.isFunction(self.config.extendREST) ){
		self.config.extendREST( rester );
	}
	console.log('Rest services added...');
	app.use( radiation.rester( rester ) );
};

ServerProto.buildUpConnect = function( cookieParser ){
	var self = this;
	var app = connect()
		.use( bodyParser.urlencoded( { extended: true } ) )
		.use( bodyParser.json() )
	;

	if( self.config.extendConnect && _.isFunction(self.config.extendConnect) ){
		self.config.extendConnect( app );
	}

	return app;
};

ServerProto.buildUpHttpsServer = function( sslPort, ipAddress, app ){
	var self = this;

	var sslOptions = {
		key: fs.readFileSync( self.config.server.ssl.key ),
		cert: fs.readFileSync( self.config.server.ssl.cert )
	};

	/*http.createServer( function (req, res) {
		res.writeHead(301, { "Location": "https://" + req.headers.host.split(':')[0] + (global.config.development?':'+sslPort:'') + req.url });
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

	var secure = self.config.server.ssl && self.config.server.ssl.key;
	var port = process.env.NODE_PORT || self.config.server.port || (secure?443:80);
	var ipAddress = process.env.NODE_IP || self.config.server.ip || '0.0.0.0';

	self.buildUpRest( app );

	if( secure )
		self.buildUpHttpsServer( port, ipAddress, app );
	else
		self.buildUpHttpServer( port, ipAddress, app );
};

ServerProto.serve = function( callback ){
	var self = this;

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
