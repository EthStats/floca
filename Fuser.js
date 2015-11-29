var Server = require('./lib/Server');
var configServices = require('./ConfigServices');
var async = require('async');
var Channeller = require('./lib/Channeller');

function Fuser( option ){
	this.option = option || {};

	this.channeller = option.channeller || new Channeller();
	configServices.file( './lib/defaultConfig' ).argv().env().add( this.option );

	this.config = configServices.config();

	this.channeller.init( this.config );
}

var FuserProto = Fuser.prototype;

FuserProto.start = function( callbackFn ){
	var self = this;

	var calls = [
		function(cb){
			self.server = new Server( self.config, self.channeller, cb );
		},
		function(cb){
			self.server.serve( cb );
		}
	];
	async.series( calls, function(err, res){
		if( err )
			self.stop( callbackFn, err, res );
		else if( callbackFn )
			callbackFn(err, res);
	} );
};

FuserProto.Channeller = Channeller;

FuserProto.stop = function( callbackFn, err, res ){
	if( this.server )
		this.server.close( callbackFn );
	else if( callbackFn )
		callbackFn( err, res );
};

module.exports = exports = Fuser;
