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
	async.series( calls, function(err, res){
		if( err )
			self.stop( callbackFn, err, res );
		else if( callbackFn )
			callbackFn(err, res);
	} );
};

FuserProto.stop = function( callbackFn, err, res ){
	if( this.server )
		this.server.close( callbackFn );
	else if( callbackFn )
		callbackFn( err, res );
};

module.exports = exports = Fuser;
