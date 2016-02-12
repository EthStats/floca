var fs = require('fs');
var path = require('path');
var jade = require('jade');

function findTemplate( folder, page, subfolder, template, callback ){
	template = template || page;
	var file = path.join( folder, page, subfolder, template + '.jade' );
	fs.exists( file, function (exists) {
		return !exists ? findTemplate( folder, page, subfolder, 'index', callback ) : callback( null, file );
	} );
}

module.exports = {
	name: 'JadeRenderer',
	init: function (config, callback) {
		this.config = config;
		callback();
	},
	_renderFile: function( error, folder, page, subfolder, template, globals, ignite, callback ){
		var self = this;

		findTemplate( folder, page, subfolder, template, function( err, file ){
			if(!err) return jade.renderFile( file, globals || { }, callback );

			if( !error && self.config.errorPage )
				self._renderFile( true, self.config.errorPage, subfolder, '', globals, ignite, callback );
			else
				callback( new Error('No such page exists') );
		} );
	},
	render: function( folder, page, subfolder, globals, ignite, callback ){
		this._renderFile( false, folder, page, subfolder, page, globals, ignite, callback );
	}
};
