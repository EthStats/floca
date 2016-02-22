module.exports = {
	name: 'Alice',
	rest: true,
	websocket: false,
	init: function (config, callback) {
		console.log('Alice initiated with: ', config)
	},
	welcome: function ( greetings, terms, ignite, callback ) {
		callback( null, greetings )
	}
}
