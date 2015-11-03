var Server = require('./lib/Server');
var configServices = require('./ConfigServices');
var async = require('async');

function Fuser( option ){
	this.option = option || {};

	configServices.file( './lib/defaultConfig' ).argv().env().add( this.option );

	this.config = configServices.config();
}

var FuserProto = Fuser.prototype;

FuserProto.start = function( callbackFn ){
	var self = this;

	var calls = [
		function(cb){
			self.server = new Server( self.config, cb );
		},
		function(cb){
			self.server.serve( cb );
		}
	];
	async.series( calls, function(err){
		if( err )
			self.stop( callbackFn, err );
		else if( callbackFn )
			callbackFn();
	} );
};

FuserProto.stop = function( callbackFn, err ){
	if( this.server )
		this.server.close( callbackFn );
	else if( callbackFn )
		callbackFn( err );
};

module.exports = exports = Fuser;
