module.exports = {
	name: 'ActorEntity',
	init: function (config, callback) {
		console.log(this.name + ' initiated with: ', config)
	},
	doSomething: function (message, terms, ignite, callback) {
		callback(null, this.name + ': ' + message)
	}
}
