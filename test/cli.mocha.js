var Executer = require('../Executer')

var Clerobee = require('Clerobee')
var clerobee = new Clerobee( 16 )

var _ = require('isa.js')

var path = require('path')

var rimraf = require('rimraf')

global.done = function ( message ) {
	console.log( message || 'Done.' )
}
global.forceExit = function ( err ) {
	console.error( _.isString(err) ? new Error(err) : err )
}

describe('floca-services', function () {

	var projectFolder = path.join( process.cwd(), './temp' )

	before(function (done) {
		rimraf( projectFolder, done )
	} )

	describe('Project tests', function () {
		it('Basic project test', function ( done ) {
			var id = clerobee.generate()
			console.log( ('Alma' + id) )
			Executer.execute( 'create', 'project', 'Alma' + id, '--appName=MochaProject', '--entityName=Alma', '--projectFolder=' + projectFolder )
			done()
		})
		it('AMQP project test', function ( done ) {
			var id = clerobee.generate()
			console.log( ('Alma' + id) )
			Executer.execute( 'create', 'project', 'Alma' + id, '--amqp', '--appName=MochaProject', '--entityName=Alma', '--projectFolder=' + projectFolder )
			done()
		})
		it('NSQ project test', function ( done ) {
			var id = clerobee.generate()
			console.log( ('Alma' + id) )
			Executer.execute( 'create', 'project', 'Alma' + id, '--nsq', '--appName=MochaProject', '--entityName=Alma', '--projectFolder=' + projectFolder )
			done()
		})
		it('WEB project test', function ( done ) {
			var id = clerobee.generate()
			console.log( ('Alma' + id) )
			Executer.execute( 'create', 'project', 'Alma' + id, '--web', '--appName=MochaProject', '--entityName=Alma', '--projectFolder=' + projectFolder )
			done()
		})
		it('Gulp project test', function ( done ) {
			var id = clerobee.generate()
			console.log( ('Alma' + id) )
			Executer.execute( 'create', 'project', 'Alma' + id, '--gulp', '--appName=MochaProject', '--entityName=Alma', '--projectFolder=' + projectFolder )
			done()
		})
	})

	describe('Entity tests', function () {
		it('Basic entity test', function ( done ) {
			var id = clerobee.generate()
			console.log( ('Korte' + id) )
			Executer.execute( 'create', 'project', 'Korte' + id, '--appName=MochaProject', '--entityName=Korte', '--projectFolder=' + projectFolder )
			Executer.execute( 'create', 'entity', 'AlmaEntity', '--projectFolder=' + path.join( projectFolder, 'Korte' + id ) )
			done()
		})
		it('REST entity test', function ( done ) {
			var id = clerobee.generate()
			console.log( ('Korte' + id) )
			Executer.execute( 'create', 'project', 'Korte' + id, '--appName=MochaProject', '--entityName=Korte', '--projectFolder=' + projectFolder )
			Executer.execute( 'create', 'entity', 'AlmaEntity', '--rest', '--projectFolder=' + path.join( projectFolder, 'Korte' + id ) )
			done()
		})
		it('Websocket entity test', function ( done ) {
			var id = clerobee.generate()
			console.log( ('Korte' + id) )
			Executer.execute( 'create', 'project', 'Korte' + id, '--appName=MochaProject', '--entityName=Korte', '--projectFolder=' + projectFolder )
			Executer.execute( 'create', 'entity', 'AlmaEntity', '--websocket', '--projectFolder=' + path.join( projectFolder, 'Korte' + id ) )
			done()
		})
	})

	describe('Service tests', function () {
	})

	after(function (done) {
		// rimraf( projectFolder, done )
		done()
	} )

} )
