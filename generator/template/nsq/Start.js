var Fuser = require('floca')
var FuserNSQ = require('floca-nsq')
var _ = require('lodash')

var fuserNSQ = new FuserNSQ()
var fuser = new Fuser( _.assign( {
	channeller: fuserNSQ
}, require('./config') ) )

fuser.start( function () {
	console.log('Started.')
} )
