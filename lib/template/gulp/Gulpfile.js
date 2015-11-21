var options = global.options = require('./gulp/ConfigServices').env().argv().config();
var path = require('path');

var gulp = global.gulp = require('gulp'),
	plugins = global.plugins = require("gulp-load-plugins")( { scope: ['devDependencies'] } );

var runSequence = global.runSequence = require('run-sequence');
var fs = require('fs');
var rimraf = global.rimraf = require('rimraf');

var server = require( './gulp/server' );

gulp.task( 'build', function(callback) {
	runSequence(
		'build-server', callback
	);
} );

gulp.task( 'test', ['build'], function(callback) {
	options.development = true;
	runSequence(
		'test-server', callback
	);
} );

gulp.task( 'watch', function(callback) {
	options.development = true;
	runSequence(
		'watch-server', callback
	);
} );

gulp.task( 'default', [ 'build' ] );
