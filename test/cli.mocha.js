var Executer = require('../Executer')

var Clerobee = require('Clerobee')
var clerobee = new Clerobee( 16 )

var _ = require('isa.js')

var fs = require('fs')
var path = require('path')

var rimraf = require('rimraf')

global.done = function ( message ) {
	console.log( message || 'Done.' )
}
global.forceExit = function ( err ) {
	err = _.isString(err) ? new Error(err) : err
	console.error( err )
	throw err
}

var FlowComposer = require('../FlowComposer')
var FlowParser = require('./FlowParser')
function analyseFlows ( name, flows ) {
	var res = []
	var flowParser = new FlowParser()
	flows.forEach( function (flow) {
		flowParser.init( flow )

		res.push( flowParser.interactionsOf( name ) )
	} )
	return { interactions: res }
}
function interactionPrinter ( interactions ) {
	var interactionDef = '', fnName = '', messages
	interactions.forEach( function (interaction) {
		if ( interaction.initiates.length > 0 ) {
			fnName = interaction.name || interaction.title
			messages = interaction.initiates.map( function (initiate) {
				return initiate.initiate.actorB.name + '.' + initiate.initiate.message
			} )
			interactionDef = interactionDef.concat( FlowComposer.createInteraction( fnName, messages ) )
		}

		interaction.interacts.forEach( function ( interaction ) {
			fnName = interaction.action.message + ':'
			messages = interaction.subActions.map( function (subAction) {
				return subAction.actorB.name + '.' + subAction.message
			} )
			interactionDef = interactionDef.concat( FlowComposer.createInteraction( fnName, messages ) )
		} )
	} )
	return interactionDef
}

describe('floca-services', function () {

	var projectFolder = path.join( process.cwd(), './_temp' )

	before(function (done) {
		rimraf( projectFolder, done )
	} )

	describe('Project tests', function () {
		var name = 'Frame'
		it('Basic project test', function ( done ) {
			var id = clerobee.generate()
			console.log( (name + id) )
			Executer.execute( 'create', 'project', name + id, '--appName=MochaProject', '--entityName=Alma', '--projectFolder=' + projectFolder )
			done()
		})
		it('AMQP project test', function ( done ) {
			var id = clerobee.generate()
			console.log( (name + id) )
			Executer.execute( 'create', 'project', name + id, '--amqp', '--appName=MochaProject', '--entityName=' + name, '--projectFolder=' + projectFolder )
			done()
		})
		it('NSQ project test', function ( done ) {
			var id = clerobee.generate()
			console.log( (name + id) )
			Executer.execute( 'create', 'project', name + id, '--nsq', '--appName=MochaProject', '--entityName=' + name, '--projectFolder=' + projectFolder )
			done()
		})
		it('WEB project test', function ( done ) {
			var id = clerobee.generate()
			console.log( (name + id) )
			Executer.execute( 'create', 'project', name + id, '--web', '--appName=MochaProject', '--entityName=' + name, '--projectFolder=' + projectFolder )
			done()
		})
		it('Gulp project test', function ( done ) {
			var id = clerobee.generate()
			console.log( (name + id) )
			Executer.execute( 'create', 'project', name + id, '--gulp', '--appName=MochaProject', '--entityName=' + name, '--projectFolder=' + projectFolder )
			done()
		})
	})

	describe('Entity tests', function () {
		var name = 'Provider'
		it('Basic entity test', function ( done ) {
			var id = clerobee.generate()
			console.log( (name + id) )
			Executer.execute( 'create', 'project', name + id, '--appName=MochaProject', '--entityName=' + name, '--projectFolder=' + projectFolder )
			Executer.execute( 'create', 'entity', name + 'Entity', '--projectFolder=' + path.join( projectFolder, name + id ) )
			done()
		})
		it('REST entity test', function ( done ) {
			var id = clerobee.generate()
			console.log( (name + id) )
			Executer.execute( 'create', 'project', name + id, '--appName=MochaProject', '--entityName=' + name, '--projectFolder=' + projectFolder )
			Executer.execute( 'create', 'entity', name + 'Entity', '--rest', '--projectFolder=' + path.join( projectFolder, name + id ) )
			done()
		})
		it('Websocket entity test', function ( done ) {
			var id = clerobee.generate()
			console.log( (name + id) )
			Executer.execute( 'create', 'project', name + id, '--appName=MochaProject', '--entityName=' + name, '--projectFolder=' + projectFolder )
			Executer.execute( 'create', 'entity', name + 'Entity', '--websocket', '--projectFolder=' + path.join( projectFolder, name + id ) )
			done()
		})
	})

	describe('Service tests', function () {
		var name = 'Actor'
		it('Basic service test', function ( done ) {
			var id = clerobee.generate()
			console.log( (name + id) )
			Executer.execute( 'create', 'project', name + id, '--appName=MochaProject', '--entityName=' + name, '--projectFolder=' + projectFolder )
			Executer.execute( 'create', 'entity', name + 'Entity', '--projectFolder=' + path.join( projectFolder, name + id ) )
			Executer.execute( 'create', 'service', name + 'Entity', 'doSomething', '--projectFolder=' + path.join( projectFolder, name + id ) )
			done()
		})
		it('Interaction test', function ( done ) {
			var id = clerobee.generate()
			console.log( (name + id) )

			var flow = JSON.parse( fs.readFileSync( path.join( __dirname, 'interaction.flow.json' ), 'utf8') )
			var interaction = interactionPrinter( analyseFlows( 'Cachier', [ flow ] ).interactions )

			Executer.execute( 'create', 'project', name + id, '--appName=MochaProject', '--entityName=' + name, '--projectFolder=' + projectFolder )
			Executer.execute( 'create', 'entity', 'Cachier', '--projectFolder=' + path.join( projectFolder, name + id ) )
			Executer.execute( 'generate', 'interaction', 'Cachier', interaction, '--projectFolder=' + path.join( projectFolder, name + id ) )
			done()
		})
	})

	after(function (done) {
		// rimraf( projectFolder, done )
		done()
	} )

} )
