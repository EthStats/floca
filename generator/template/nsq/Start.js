var Fuser = require('floca')
var FuserNSQ = require('floca-nsq')

var Assigner = require('assign.js')
var assigner = new Assigner()

var fuserNSQ = new FuserNSQ()
var fuser = new Fuser( assigner.assign( {
	channeller: fuserNSQ
}, require('./config') ) )

fuser.start( function () {
	console.log('Started.')
} )
