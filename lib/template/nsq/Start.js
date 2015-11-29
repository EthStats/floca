var Fuser = require('floca');
var FuserNSQ = require('floca-nsq');
var _ = require('lodash');

var fuserNSQ = new FuserNSQ();
var fuser = new Fuser( _.assign( {
	channeller: fuserNSQ,
	entities: {
		appName: 'DemoApp',
		serviceName: 'DemoMicroService'
	}
}, require('./config') ) );

fuser.start( function(){
	console.log('Started.');
} );
