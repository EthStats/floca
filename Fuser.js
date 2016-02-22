var Server = require('./lib/Server')
var configServices = require('./ConfigServices')
var async = require('async')
var Channeller = require('./lib/Channeller')

var Configurer = require('./lib/DefaultConfigurer')

function Fuser ( option ) {
	this.option = option || {}

	this.channeller = option.channeller || new Channeller()
	configServices.add( Configurer.config( option.floca.appName ) ).argv().env().add( this.option )

	this.config = configServices.config()

	this.channeller.init( this.config )
}

var FuserProto = Fuser.prototype

FuserProto.start = function ( callbackFn ) {
	var self = this

	var calls = [
		function (cb) {
			self.server = new Server( self.config, self.channeller, cb )
		},
		function (cb) {
			self.server.serve( cb )
		}
	]
	async.series( calls, function (err, res) {
		if ( err )
			self.stop( callbackFn, err, res )
		else if ( callbackFn )
			callbackFn(err, res)
	} )
}

FuserProto.stop = function ( callbackFn, err, res ) {
	if ( this.server )
		this.server.close( callbackFn )
	else if ( callbackFn )
		callbackFn( err, res )
}

Fuser.Channeller = Channeller

module.exports = exports = Fuser
