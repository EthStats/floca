var path = require('path');

// NODE_APP_NAME = ''
// NODE_SERVICE_NAME = ''
module.exports = {
	entities: {
		folder: path.join( process.cwd(), 'bus'),
		appName: 'APP_NAME_IS_MISSING',
		serviceName: 'SERVICE_NAME_IS_MISSING',
		configurator: 'Tuner'
	},
	server: {
		port: 8080,
		ssl: {
			key: '', // path.join( process.cwd(), 'ssh', 'sign.key' ),
			cert: '' // path.join( process.cwd(), 'ssh', 'sign.crt' )
		},
		forcefulShutdown: 1000
	},
	log: {
		level: "info",
		file: "./floca.log",
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
		connectURL: 'amqp://localhost'
	},
	radiation: {
		name: 'Radiation',
		hideInnerServices: true,
		innerServicesPrefix: '_',
		closeRest: false
	}/*,
	extendREST: function( rester ){
		console.log('>>>>>>> extendREST');
	},
	extendConnect: function( app ){
		console.log('>>>>>>> extendConnect');
	},
	initPublisher: function( config, Publisher, cb ){
		console.log('>>>>>>> initPublisher');
		cb();
	},
	runDevelopmentTest: function( harcon ){
		harcon.simpleIgnite( 'Alice.welcome', function(err, res){
			console.log('>>>>>>', err, res);
		} );
	}*/
};
