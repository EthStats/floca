module.exports = {
	name: 'Marie',
	rest: true,
	init: function (config, callback) {
		console.log('Alice initiated...');
	},
	greet: function( terms, ignite, callback ){
		callback( null, 'Bonjour!' );
	}
};
