module.exports = {
	name: 'Marie',
	rest: true,
	init: function (config, callback) {
		console.log('Marie initiated with: ', config);
	},
	greet: function( terms, ignite, callback ){
		callback( null, 'Bonjour!' );
	}
};
