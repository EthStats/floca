module.exports = {
	name: 'Alice',
	rest: true,
	init: function (config, callback) {
		console.log('Alice initiated...');
	},
	welcome: function( terms, ignite, callback ){
		ignite( 'Marie.greet', function( err, response ){
			callback( err, response );
		} );
	}
};
