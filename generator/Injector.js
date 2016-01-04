var Collector = require('./Collector');
var path = require('path');

module.exports = {
	createMochaCode: function( options ){
		var config = require( path.join( options.projectFolder || process.cwd(), 'config' ) );

		return Collector.generateTests( config, options.folder || 'test', options );
	}
};
