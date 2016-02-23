var Fuser = require('../Fuser')

describe('floca-services', function () {

	var fuser
	before(function (done) {
		fuser = new Fuser( require('./config') )
		fuser.start( done )
	})

	describe("Test fuser's state", function () {
		it('Empty test', function ( done ) {
			console.log( fuser.config )
			done()
		})
	})

	after(function (done) {
		if ( fuser )
			fuser.stop( done )
		else
			done()
	})
})
