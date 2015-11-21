var Fuser = require('../Fuser');

var fuser = new Fuser( require('./config') );

fuser.start( function( err, res ){
	console.log('Started.', err, res );

	setTimeout(function(){
		fuser.stop( function(){
			console.log('Closed.');
		} );
	}, 1500);
} );
