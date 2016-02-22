function copyObject (source, props, object, respect) {
	object = object || { }

	var index = -1,
		length = props.length

	while (++index < length) {
		var key = props[index]
		if ( !respect || !object[key] )
			object[key] = source[key]
	}
	return object
}
function assign ( ) {
	var obj = arguments[0]
	var args = Array.prototype.slice.call(arguments, 1)
	args.forEach(function ( element ) {
		copyObject( element, Object.keys(element), obj )
	})
	return obj
}

var EventEmitter = require('events').EventEmitter
function Bus ( ) {
	EventEmitter.call( this )

	// this.stopComputationForEvents = true
}
Bus.prototype = new EventEmitter()

module.exports = {
	_: require('isa.js'),
	Hammer: require('hammerjs'),
	assign: assign,
	bus: new Bus()
}

delete module.exports.Hammer.defaults.cssProps.userSelect

window.Context = module.exports
