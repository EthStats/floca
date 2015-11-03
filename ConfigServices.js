var _ = require('lodash');

module.exports = {
	conf: {},
	env: function() {
		_.merge( this.conf, process.env );
		return this;
	},
	add: function( options ) {
		_.merge( this.conf, options );
		return this;
	},
	argv: function() {
		_.merge( this.conf, require('minimist')(process.argv.slice(2)) );
		return this;
	},
	file: function(files) {
		var self = this;
		if( !Array.isArray(files) ) files = [ files ];
		(files||[]).forEach( function( file ){
			self.conf = _.merge( self.conf, require( file ) );
		} );
		return this;
	},
	all: function(files) {
		return this.env().argv().file( files );
	},
	config: function() {
		return this.conf;
	}
};
