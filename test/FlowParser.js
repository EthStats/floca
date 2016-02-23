var _ = require('isa.js')

function collectSubActions ( flow, actor, index ) {
	var actions = [], i
	for (i = index; i < flow.signals.length; ++i) {
		var signal = flow.signals[i]
		if ( signal.type !== 'Signal' ) continue

		if ( signal.actorA.index < index )
			break
		if ( signal.actorA.index === actor.index )
			actions.push( flow.signals[i] )
	}
	return { actions: actions, index: i }
}
function getNextInteraction (flow, name, index) {
	index = index || 0
	return flow.signals.findIndex( function (signal, sIndex) {
		return sIndex >= index && signal.type === 'Signal' && signal.actorB.name === name
	} )
}
function getNextAction (flow, name, index) {
	for (var i = index; i < flow.signals.length; ++i) {
		var signal = flow.signals[i]
		if ( signal.type !== 'Signal' ) continue

		if ( signal.actorB.name === name )
			break
		if ( signal.actorA.name === name )
			return i
	}
	return -1
}

var FlowParser = function () {}

var flowParser = FlowParser.prototype

flowParser.init = function ( flowDef ) {
	var self = this
	self.flow = _.isString(flowDef) ? JSON.parse( flowDef ) : flowDef
	return self
}

flowParser.actors = function () {
	var self = this
	return self.flow.actors.map( function (actor) { return actor.name } )
}

flowParser.actor = function ( name ) {
	var self = this
	return self.flow.actors.find( function (actor) { return actor.name === name } )
}

flowParser.interactionsOf = function ( name ) {
	var self = this
	var actor = self.actor( name )

	if ( !actor ) throw new Error('Unknown Actor: ' + name)

	var interacts = [], initiates = []

	var interIndex = 0
	while ( (interIndex = getNextInteraction( self.flow, actor.name, interIndex )) > -1 ) {
		var action = self.flow.signals[interIndex]
		var subActions = collectSubActions( self.flow, actor, interIndex + 1 )

		interacts.push( {action: action, subActions: subActions.actions } )

		interIndex = subActions.index
	}

	interIndex = 0
	while ( (interIndex = getNextAction( self.flow, actor.name, interIndex )) > -1 ) {
		var initiate = self.flow.signals[interIndex]

		initiates.push( { actor: actor, initiate: initiate } )

		interIndex += 1
	}

	return { name: self.flow.name || self.flow.title, initiates: initiates, interacts: interacts }
}

module.exports = FlowParser
