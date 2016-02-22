var Assigner = require('assign.js')
var assigner = (new Assigner()).recursive(true)

module.exports = {
	conf: {},
	env: function () {
		assigner.assign( this.conf, process.env )
		return this
	},
	argv: function () {
		assigner.assign( this.conf, require('minimist')(process.argv.slice(2)) )
		return this
	},
	file: function (files) {
		var self = this
		var fileArray = files || []
		fileArray.forEach( function ( file ) {
			assigner.assign( self.conf, require( file ) )
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
