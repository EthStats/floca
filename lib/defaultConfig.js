var path = require('path');

// NODE_APP_NAME = ''
// NODE_SERVICE_NAME = ''
module.exports = {
	entities: {
		folder: path.join( process.cwd(), 'bus'),
		appName: 'APP_NAME_IS_MISSING',
		serviceName: 'SERVICE_NAME_IS_MISSING',
		configurator: '' // 'Tuner' - config(appName, compName, callback){};
	},
	server: {
		port: 8080,
		jwt: {
			key: 'x-floca-jwt',
			secret: '',
			timeout: 2 * 24 * 60 * 60,
			acquireURI: '' // '/sys/request-token'
		},
		ssl: {
			key: '', // path.join( process.cwd(), 'ssh', 'sign.key' ),
			cert: '' // path.join( process.cwd(), 'ssh', 'sign.crt' )
		},
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
		}
	},
	rest: {
		apiKeys: [ 'i61xee9n-d6a0135a-7bukc1ow-8wo0c4ss-ckcw44cs-0kwc4g48-g0g40s4w-2ajy9i0u' ]
	},
	harcon: {
		idLength: 32
	},
	amqp: {
		connectURL: 'amqp://localhost',
		socketType: 'PUBSUB',
		timeout: 0
	},
	nsq: {
		nsqdHost: '', // '127.0.0.1'
		nsqdPort: 4150
	},
	radiation: {
		name: 'Radiation',
		hideInnerServices: true,
		innerServicesPrefix: '_',
		closeRest: false
	}/*,
	extendREST: function( config, rester, pathToIgnore, harcon, tools ){
		console.log('>>>>>>> extendREST');
	},
	connectMiddlewares: function( config ){
		console.log('>>>>>>> connectMiddlewares');
		return [];
	},
	runDevelopmentTest: function( rester, harcon ){
		harcon.simpleIgnite( 'Alice.welcome', function(err, res){
			console.log('>>>>>>', err, res);
		} );
	}*/
};
