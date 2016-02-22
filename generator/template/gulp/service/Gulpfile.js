var options = global.options = require('./gulp/ConfigServices').env().argv().config()

var gulp = global.gulp = require('gulp')
global.plugins = require('gulp-load-plugins')( { scope: ['devDependencies'] } )

var runSequence = global.runSequence = require('run-sequence')
global.rimraf = require('rimraf')

require( './gulp/server' )

gulp.task( 'build', function (callback) {
	runSequence(
		'build-server', callback
	)
} )

gulp.task( 'test', ['build'], function (callback) {
	options.development = true
	runSequence(
		'test-server', callback
	)
} )

gulp.task( 'watch', function (callback) {
	options.development = true
	runSequence(
		'watch-server', callback
	)
} )

gulp.task( 'default', [ 'build' ] )
