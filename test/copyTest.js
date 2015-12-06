var path = require('path');

var fileServices = require('../generator/FileServices');

fileServices.copyAsync( path.join(__dirname, '..', 'generator', 'template', 'alice'), './almafa', { forced: true }, function(err){
	console.log( err );
} );
