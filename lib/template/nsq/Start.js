var Fuser = require('floca');
var FuserNSQ = require('floca-nsq');
var _ = require('lodash');

var fuser = new Fuser( _.assign( {
	channeller: FuserNSQ,
	entities: {
		appName: 'DemoApp',
		serviceName: 'DemoMicroService'
	}
}, require('./config') ) );

fuser.start( function(){
	console.log('Started.');
} );
