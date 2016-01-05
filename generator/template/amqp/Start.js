var Fuser = require('floca');
var FuserAMQP = require('floca-amqp');
var _ = require('lodash');

var fuserAMQP = new FuserAMQP();
var fuser = new Fuser( _.assign( {
	channeller: fuserAMQP
}, require('./config') ) );

fuser.start( function(){
	console.log('Started.');
} );
