'use strict'

let http = require('http')
let https = require('https')
let url = require('url')
let fs = require('fs')

let connect = require('connect'),
	morgan = require('morgan'),
	compression = require('compression'),
	bodyParser = require('body-parser')

let Rest = require('connect-rest')
let httphelper = Rest.httphelper()

let io = require('socket.io')

let Harcon = require('harcon')
let Radiation = require('harcon-radiation')
let radiation

let Publisher = require('./Publisher')

let _ = require('isa.js')

let Assigner = require('assign.js')
let assigner = new Assigner()

let jwt = require('jsonwebtoken')
let RestMaker = require('./RestMaker')

let async = require('async')

function redirect ( url ) {
	let status = 302

	if (arguments.length === 2) {
		status = url
		url = arguments[1]
	}

	this.statusCode = status
	this.setHeader('Location', url)
	this.setHeader('Content-Length', '0')
	this.end()
}

let Server = function ( config, channeller, callback ) {
	this.config = config

	let self = this

	self.logger = require('./WinstonLogger').createWinstonLogger( this.config.log, this.config )

	assigner.recursive( true )

	let iopts

	let channelConfig = {
		name: self.config.NODE_APP_NAME || self.config.floca.appName,
		Barrel: channeller.Barrel(),
		barrel: channeller.barrel(),
		idLength: 32,
		logger: self.logger,
		millieu: self.config.floca.millieu || {}
	}
	iopts = assigner.assign( channelConfig, self.config.harcon || {} )
	iopts.environment = assigner.assign( iopts.environment || {}, { httphelper: httphelper } )

	let secure = self.config.server.ssl.key
	let portToMap = self.config.NODE_SERVER_PORT || self.config.server.port || (secure ? 443 : 8080)

	let fns = []
	fns.push( function (cb) {
		self.harcon = new Harcon( iopts, cb )
	} )
	fns.push( function (cb) {
		let ropts = assigner.assign( { logger: self.logger, port: portToMap }, self.config.radiation || { } )
		radiation = new Radiation( self.harcon, ropts )
		radiation.init( cb )
	} )
	fns.push( function (cb) {
		self.setupTerminationHandlers()

		if ( self.config.initer && _.isFunction(self.config.initer) )
			self.config.initer( cb )
		else cb()
	} )
	async.series( fns, callback )
}

let ServerProto = Server.prototype

ServerProto.setupTerminationHandlers = function () {
	let self = this

	let signs = [
		'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
		'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
	]
	signs.forEach(function (element) {
		process.on(element, function () {
			console.log('%s: Node server stopped.', Date(Date.now()), element )
			self.close()
		})
	})
}

let pathToIgnore = []
ServerProto.buildUpRest = function ( app ) {
	let self = this

	let options = assigner.assign( {
		context: '/api',
		logger: self.logger,
		discoverPath: 'discover',
		protoPath: 'proto',
		headers: self.originHeaders
	}, self.config.rest || {} )
	if ( !self.config.development ) {
		delete options.discoverPath
		delete options.protoPath
	}
	let rester = Rest.create( options )

	app.use( radiation.rester( rester ) )

	if ( self.config.server.jwt.secret && self.config.server.jwt.acquireURI )
		RestMaker.buildUp( radiation, rester, self.harcon, { jwt: jwt, jwtConfig: self.config.server.jwt, pathToIgnore: pathToIgnore } )

	if (self.config.floca.apiDocs && self.config.floca.apiDocs.enabled)
		RestMaker.apiDocs( radiation, rester, self.harcon, self.config.floca.apiDocs )

	if ( self.config.extendREST && _.isFunction(self.config.extendREST) ) {
		self.config.extendREST( self.config, rester, pathToIgnore, self.harcon, { jwt: jwt } )
	}
	console.log('Rest services added...')
}

ServerProto.buildUpIO = function ( server ) {
	io = radiation.io( io.listen( server ), { verifyJwtToken: this.verifyJwtToken.bind( this ) } )
	console.log('Websocket services added...')
}

ServerProto.verifyJwtToken = function (token, callback) {
	jwt.verify(token, this.config.server.jwt.secret, callback )
}

ServerProto.buildUpConnect = function ( cookieParser ) {
	let self = this

	let jwtKey = self.config.server.jwt.key || 'x-floca-jwt'
	self.originHeaders = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
		'Access-Control-Allow-Headers': 'api-key, x-api-key, ' + jwtKey + ', Accept, Origin, Content-Type',
		'Access-Control-Expose-Headers': jwtKey
	}

	let app = connect()

	if ( self.config.development )
		app = app.use( morgan('dev') )

	app = app
		.use( compression() )

	if ( self.config.connectMiddlewares && _.isFunction(self.config.connectMiddlewares) ) {
		let middlewares = self.config.connectMiddlewares( self.config ) || []
		middlewares.forEach( function (middleware) {
			app = app.use( middleware )
		} )
	}

	app = app
			.use( bodyParser.urlencoded( { extended: true } ) )
			.use( bodyParser.json() )

	if ( self.config.server.jwt.secret )
		app.use( function (req, res, next) {
			if ( req.method === 'OPTIONS' )
				return next()

			let ignoring = pathToIgnore.find( function (path) {
				if ( _.isString( path ) )
					return path.endsWith('*' ) ? (req.url.startsWith( path.substring( 0, path.length - 1 ) )) : (path === req.url)
				else if ( _.isFunction( path ) )
					return path( req.url )
				else return false
			} )
			if ( ignoring )
				return next()

			let token = req.headers[ self.config.server.jwt.key ] || ''
			self.verifyJwtToken( token, function (err, decoded) {
				if ( err ) {
					for (let key in self.originHeaders)
						res.setHeader( key, self.originHeaders[key] )
					res.setHeader( 'Content-type', 'text/plain' )
					res.statusCode = 401
					res.end( 'Invalid or missing token.' )
				}
				else {
					req.user = decoded
					next( )
				}
			})
		} )

	if ( self.config.extendPureREST ) {
		[ 'get', 'post', 'del', 'put', 'head', 'options' ].forEach( function (method) {
			if (!app[method])
				app[method] = function ( path, handlerFn ) {
					let METHOD = (method === 'del') ? 'DELETE' : method.toUpperCase()
					app.use( function (req, res, next) {
						if ( req.method === METHOD && ( req.url === path || req.url.startsWith( path + '?' ) ) ) {
							if (!req.query)
								req.query = url.parse( req.url, true ).query || {}
							if ( !res.redirect )
								res.redirect = redirect
							return handlerFn( req, res, next )
						}
						return next()
					} )
					return app
				}
		} )
		self.config.extendPureREST( self.config, app, pathToIgnore, self.harcon, { jwt: jwt } )
	}

	return app
}

ServerProto.buildUpHttpsServer = function ( sslPort, ipAddress, app, fn ) {
	let self = this

	let sslOptions = {
		key: fs.readFileSync( self.config.server.ssl.key ),
		cert: fs.readFileSync( self.config.server.ssl.cert )
	}

	/* http.createServer( function (req, res) {
		res.writeHead(301, { "Location": "https://" + req.headers.host.split(':')[0] + (self.config.development?':'+sslPort:'') + req.url })
		res.end()
	} )*/
	this.secureServer = https.createServer(sslOptions, app)

	if ( fn )
		fn( this.secureServer )

	this.secureServer.listen(sslPort, ipAddress, function () {
		console.log('Running on https://' + ipAddress + ':' + sslPort)
	})
}
ServerProto.buildUpHttpServer = function ( port, ipAddress, app, fn ) {
	this.server = http.createServer( app )

	if ( fn )
		fn( this.server )

	this.server.listen( port, ipAddress, function () {
		console.log('Running on http://' + ipAddress + ':' + port)
	})
}
ServerProto.buildUpServer = function ( ) {
	let self = this

	let app = self.buildUpConnect( )

	let secure = self.config.server.ssl.key
	let port = self.config.NODE_SERVER_PORT || self.config.server.port || (secure ? 443 : 8080)
	let ipAddress = self.config.NODE_SERVER_IP || self.config.server.ip || '0.0.0.0'

	if ( self.config.NODE_SERVER_REST || self.config.server.rest )
		self.buildUpRest( app )

	let websocket = !!( self.config.NODE_SERVER_WEBSOCKET || self.config.server.websocket )

	if ( secure )
		self.buildUpHttpsServer( port, ipAddress, app, websocket ? function ( server ) {
			self.buildUpIO( server )
		} : null )
	else
		self.buildUpHttpServer( port, ipAddress, app, websocket ? function ( server ) {
			self.buildUpIO( server )
		} : null )
}

ServerProto.serve = function ( callback ) {
	let self = this

	let executer = self.config.initPublisher && _.isFunction(self.config.initPublisher) ? self.config.initPublisher : function (c, p, cb) { cb() }
	executer( self.config, Publisher, function (err, res) {
		if ( err ) return callback( err )

		if ( self.config.NODE_SERVER_ACTIVE || self.config.server.active )
			self.buildUpServer( )

		Publisher.setHarcon( self.harcon ).addGlobalConfig( self.config )
		self.harcon.addicts( Publisher )
		Publisher.watch( self.config.floca.folder, self.config.server.watchTimeout || -1, null, function (err, res) {
			if ( err )
				return callback ? callback(err) : err

			if ( self.config.development )
				setTimeout( function () {
					console.log( self.harcon.divisions() )
					console.log( self.harcon.entities() )

					if ( self.config.runDevelopmentTest && _.isFunction(self.config.runDevelopmentTest) )
						self.config.runDevelopmentTest( self.harcon )

					console.log( require('util').inspect(process.memoryUsage()) )
				}, 1000 )

			if ( callback )
				callback( err, res )
		} )
	})
}

ServerProto.close = function ( callback ) {
	let self = this

	Publisher.close()

	if ( this.server )
		this.server.close( function () {
			self.server = null
			console.log('HTTP stopped')
		} )

	if ( this.secureServer )
		this.secureServer.close( function () {
			self.secureServer = null
			console.log('HTTPS stopped')
		} )

	if ( this.harcon )
		this.harcon.close( callback )
	else if ( callback )
		callback()

	if ( self.config.server.forcefulShutdown )
		setTimeout(
			function () { process.exit( 1 ) },
			self.config.server.forcefulShutdown
		)
}

module.exports = exports = Server
