var _ = require('lodash')

module.exports = {
	conf: {},
	env: function () {
		_.merge( this.conf, process.env )
		return this
	},
	argv: function () {
		_.merge( this.conf, require('minimist')(process.argv.slice(2)) )
		return this
	},
	file: function (files) {
		var self = this
		var fileArray = files || []
		fileArray.forEach( function ( file ) {
			_.merge( self.conf, require( file ) )
		} )
		return self
	},
	all: function (files) {
		return this.env().argv().file( files )
	},
	config: function () {
		return this.conf
	}
}
