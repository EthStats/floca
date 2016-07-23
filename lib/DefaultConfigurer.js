'use strict'

let path = require('path')

// NODE_SERVER_PORT 80 / 443
// NODE_SERVER_IP 0.0.0.0
// NODE_SERVER_ACTIVE = true
// NODE_SERVER_REST = true
// NODE_SERVER_WEBSOCKET = true
// NODE_APP_NAME = ''
// NODE_ENTITY_NAME = ''
module.exports = {
	config: function ( appName ) {
		return {
			floca: {
				folder: path.join( process.cwd(), 'bus'),
				appName: 'APP_NAME_IS_MISSING',
				entityName: 'ENTITY_NAME_IS_MISSING',
				apiDocs: {
					enabled: false,
					path: '/docs',
					context: '/api'
				},
				configurator: '' // 'Tuner' - config(appName, compName, callback) {}
			},
			server: {
				active: false,
				rest: true,
				websocket: true,
				port: 8080,
				jwt: {
					key: 'x-floca-jwt',
					secret: '',
					timeout: '12h',
					acquireURI: '', // '/sys/request-token'
					algorithm: 'HS384'
				},
				ssl: {
					key: '', // path.join( process.cwd(), 'ssh', 'sign.key' ),
					cert: '' // path.join( process.cwd(), 'ssh', 'sign.crt' )
				},
				watchTimeout: -1,
				forcefulShutdown: 1000
			},
			log: {
				level: 'info',
				file: '', // './floca.log',
				maxsize: 10485760,
				maxFiles: 10,
				depth: 1,
				loggly: {
					token: '',
					subdomain: ''
				},
				papertrail: {
					host: '',
					port: 12345,
					level: 'info',
					colorize: true,
					handleExceptions: true,
					timestamp: function () {
						return new Date().toString()
					},
					logFormat: function (level, message) {
						return `[${level}] ${message}`
					}
				},
				addStackTo: [/* 'silly',*/ 'verbose', /* 'info', 'warn', 'debug',*/ 'error' /* , 'log'*/ ]
			},
			rest: {
				// apiKeys: [ 'i61xee9n-d6a0135a-7bukc1ow-8wo0c4ss-ckcw44cs-0kwc4g48-g0g40s4w-2ajy9i0u' ]
			},
			harcon: {
				idLength: 32,
				blower: {
					commTimeout: 3000
				}
			},
			amqp: {
				connectURL: 'amqp://localhost', // AMQP_CONN_URL
				timeout: 0,
				expiration: 3000,
				nodeSeqNo: 1, // AMQP_NODE_SEQ_NO
				nodeCount: 1, // AMQP_NODE_COUNT
				idLength: 32
			},
			mqtt: {
				connectURL: 'mqtt://localhost', // MQTT_CONN_URL
				timeout: 0,
				nodeSeqNo: 1, // MQTT_NODE_SEQ_NO
				nodeCount: 1, // MQTT_NODE_COUNT
				idLength: 32
			},
			nsq: {
				nsqdHost: '127.0.0.1', // NSQ_HOST
				nsqdPort: 4150 // NSQ_PORT
			},
			radiation: {
				name: 'Radiation',
				rest: {
					ignoreRESTPattern: true,
					harconrpcPath: '/' + appName
				},
				websocket: {
					socketPath: '/' + appName,
					jsonrpcPath: '',
					passthrough: true
				}
			}/*,
			extendPureREST: function ( config, app, pathToIgnore, harcon, tools ) {
				app.rest( path, function (req, res, next) {} )
			},
			extendREST: function ( config, rester, pathToIgnore, harcon, tools ) {
				console.log('>>>>>>> extendREST')
			},
			connectMiddlewares: function ( config ) {
				console.log('>>>>>>> connectMiddlewares')
				return []
			},
			runDevelopmentTest: function ( rester, harcon ) {
				harcon.simpleIgnite( 'Alice.welcome', function (err, res) {
					console.log('>>>>>>', err, res)
				} )
			}*/
		}
	}
}
