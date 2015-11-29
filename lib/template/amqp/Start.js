var Fuser = require('floca');
var FuserAMQP = require('floca-amqp');
var _ = require('lodash');

var fuser = new Fuser( _.assign( {
	channeller: FuserAMQP,
	entities: {
		appName: 'DemoApp',
		serviceName: 'DemoMicroService'
	}
}, require('./config') ) );

fuser.start( function(){
	console.log('Started.');
} );
