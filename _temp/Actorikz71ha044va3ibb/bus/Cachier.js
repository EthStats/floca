var async = require('async')

module.exports = {
	name: 'Cachier',
	init: function (config, callback) {
		console.log(this.name + ' initiated with: ', config)
	},
	transaction: function (message, terms, ignite, callback) {
		var fns = []

		fns.push(function (cb) {
			ignite('Auditor.validate', message, cb)
		})

		fns.push(function (cb) {
			ignite('Storage.book', message, cb)
		})

		fns.push(function (cb) {
			ignite('Collector.prepare', message, cb)
		})

		async.series(fns, function (err, res) {
			callback(err, res)
		})
	}
}
