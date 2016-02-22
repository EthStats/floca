var options = global.options = require('./gulp/ConfigServices').env().argv().config()

var gulp = global.gulp = require('gulp')
global.plugins = require('gulp-load-plugins')( { scope: ['devDependencies'] } )

var runSequence = global.runSequence = require('run-sequence')
global.rimraf = require('rimraf')

require( './gulp/server' )
require( './gulp/web' )


gulp.task( 'build', function (callback) {
	runSequence(
		'build-server', 'build-web', callback
	)
} )

gulp.task( 'test', ['build'], function (callback) {
	options.development = true
	runSequence(
		'test-server', 'test-web', callback
	)
} )

gulp.task( 'watch', function (callback) {
	options.development = true
	runSequence(
		'watch-server', 'watch-web', callback
	)
} )

gulp.task( 'default', [ 'build' ] )
