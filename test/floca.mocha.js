var Fuser = require('../Fuser')

var Rest = require('connect-rest')
var httphelper = Rest.httphelper()

function DummyLogger () { }
DummyLogger.prototype.info = function () { console.log( arguments ) }
DummyLogger.prototype.debug = function () { console.log( arguments ) }
DummyLogger.prototype.error = function () { console.error( arguments ) }
var logger = new DummyLogger()

describe('floca-services', function () {

	var fuser
	before(function (done) {
		fuser = new Fuser( require('./config') )
		fuser.start( done )
	})

	describe("Test fuser's state", function () {
		it('Empty test', function ( done ) {
			var RPCCall = { division: 'DemoApp', event: 'Inflicter.vivid', params: [ ] }
			httphelper.generalCall( 'http://localhost:8080/DemoApp', 'POST', {'x-api-key': '849b7648-14b8-4154-9ef2-8d1dc4c2b7e9'}, null, RPCCall, 'application/json', logger,
				function (err, result, status) {
					console.log( err, result, status )

					done( )
				}
			)
		})
	})

	after(function (done) {
		if ( fuser )
			fuser.stop( done )
		else
			done()
	})
})
