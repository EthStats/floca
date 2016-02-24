var Assigner = require('assign.js')
var assigner = (new Assigner()).recursive(true)

module.exports = {
	conf: {},
	env: function () {
		assigner.assign( this.conf, process.env )
		return this
	},
	add: function ( options ) {
		assigner.assign( this.conf, options )
		return this
	},
	argv: function ( index ) {
		assigner.assign( this.conf, require('minimist')(process.argv.slice(index || 2)) )
		return this
	},
	file: function (files) {
		var self = this
		if ( !Array.isArray(files) ) files = [ files ]
		var filesArray = files || []
		filesArray.forEach( function ( file ) {
			self.conf = assigner.assign( self.conf, require( file ) )
		} )
		return this
	},
	all: function (files) {
		return this.env().argv().file( files )
	},
	config: function () {
		return this.conf
	}
}
