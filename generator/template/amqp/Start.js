var Fuser = require('floca')
var FuserAMQP = require('floca-amqp')

var Assigner = require('assign.js')
var assigner = new Assigner()

var fuserAMQP = new FuserAMQP()
var fuser = new Fuser( assigner.assign( {
	channeller: fuserAMQP
}, require('./config') ) )

fuser.start( function () {
	console.log('Started.')
} )
