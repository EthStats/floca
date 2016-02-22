var Fuser = require('floca')

var fuser = new Fuser( require('./config') )

fuser.start( function () {
	console.log('Started.')
} )
