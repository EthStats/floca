var Collector = require('./Collector')
var path = require('path')
var fs = require('fs')

var _ = require('lodash')

var tempPathFn = path.join.bind( path, __dirname, 'template' )
var actionDef = fs.readFileSync( tempPathFn('service', 'action.def'), {encoding: 'utf8'} )
var interactionDef = fs.readFileSync( tempPathFn('service', 'interaction.def'), {encoding: 'utf8'} )


var beautify = require('js-beautify').js_beautify
var beautifyConfig = process.env.JS_BEAUTIFY_CONFIG ? require( process.env.JS_BEAUTIFY_CONFIG ) : { indent_size: 4, end_with_newline: true }


function validateEntity (entity) {
	return entity.name && entity.init && _.isFunction( entity.init )
}

// interaction format: act:B.message,F.C.message,A.D.message
function addInteractionsToEntity ( interaction, entityPath, options ) {
	var defs = interaction.split('_')
	var entityDef = fs.readFileSync( entityPath, {encoding: 'utf8'} )
	var interDef = ''
	for (var i = 0; i < defs.length; ++i) {
		if ( !defs[i] ) continue
		var elements = defs[i].split( ':' )
		if ( elements.length !== 2 ) throw new Error('Malformed definition:', defs[i])

		var callDef = ''
		var actor = elements[0]
		var messages = elements[1].split(',')
		if ( !actor ) throw new Error('Missing function name:', defs[i])
		if ( entityDef.indexOf( actor + ':') > -1 ) throw new Error('Function already exists:', actor)

		messages.forEach( function ( message ) {
			callDef = callDef + actionDef.replace('$$$entity$$$', message )
		} )
		interDef = interDef + interactionDef.replace('$$$name$$$', actor ).replace('$$$inters$$$', callDef )
	}

	var hasAsync = entityDef.indexOf('var async') > -1
	var code = beautify(
		(hasAsync ? '' : 'var async = require(\'async\')\n\n') + entityDef.substring( 0, entityDef.lastIndexOf('}') ) + interDef + entityDef.substring( entityDef.lastIndexOf('}') ),
		beautifyConfig
	)
	fs.writeFileSync( entityPath, code, {encoding: 'utf8'} )
}

module.exports = {
	createMochaCode: function ( options ) {
		var config = require( path.join( options.projectFolder || process.cwd(), 'config' ) )

		return Collector.generateTests( config, options.folder || 'test', options )
	},
	createInteraction: function ( entity, interaction, options ) {
		try {
			var entityPath = path.join( options.projectFolder || process.cwd(), 'bus', entity.endsWith('.js') ? entity : entity + '.js' )
			var component = require( entityPath )
			if ( !validateEntity(component) )
				return global.forceExit('Component does not seem to be a floca entity!', entity)
			addInteractionsToEntity( interaction, entityPath, options )
			console.log('Done.')
		} catch (err) {
			console.error( err )
		}
	}
}
