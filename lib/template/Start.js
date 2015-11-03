var Fuser = require('../Fuser');
var _ = require('lodash');

var fuser = new Fuser( _.assign( {
	entities: {
		appName: 'DemoApp',
		serviceName: 'DemoMicroService'
	}
}, require('./config') ) );

fuser.start( function(){
	console.log('Started.');
} );
