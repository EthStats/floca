var gulp = global.gulp

var fs = require('fs')
global.gutil = require('gulp-util')
global.webpack = require('webpack')

var _ = require('lodash')
var services = require('./services')

var join = require('path').join
var resolve = require('path').resolve

var models = './node_modules/n-models/models'
var srcFolder = './src'
var pagesFolder = './src/pages'
var tempFolder = './src/build'
var distFolder = './www'
var jsTasks = [], viewTasks = [], styleTasks = [], buildTasks = [ 'web-lint', 'compress-images' ]




gulp.task( 'web-lint', function () {
	return gulp.src( [ pagesFolder + '/**/*.js', '!' + pagesFolder + '/static/**/*.js', '!' + pagesFolder + '/build/**/*.js', '!' + pagesFolder + '/**/Template.js'] )
		.pipe( global.plugins.eslint() )
		.pipe( global.plugins.eslint.format() )
		.pipe( global.plugins.eslint.failOnError() )
})
gulp.task( 'copy-static', [ ], function ( ) {
	return gulp.src( [ srcFolder + '/static/**/*', '!' + srcFolder + '/static/**/*.gif', '!' + srcFolder + '/static/**/*.svg', '!' + srcFolder + '/static/**/*.jpeg', '!' + srcFolder + '/static/**/*.png', '!' + srcFolder + '/static/**/*.jpg'] )
		.pipe( gulp.dest( distFolder ) )
})
gulp.task( 'compress-images', ['copy-static'], function () {
	return gulp.src([ srcFolder + '/static/**/*.{png,jpg,jpeg,gif,svg}'])
		.pipe( global.plugins.imagemin({
			progressive: true,
			optimizationLevel: 3,
			multipass: true,
			svgoPlugins: [
				{convertColors: false},
				{mergePaths: false},
				{removeViewBox: false}
			]
		}))
		.pipe(gulp.dest( distFolder ))
		.pipe( global.plugins.livereload() )
})


[
	{ name: 'landing', subpages: [ ], type: 'static' }
].forEach( function ( obj ) {
	var page = obj.name
	var tasks = services.createTasks( _.merge( {
		pageName: page,
		sourceFolder: resolve( join( pagesFolder, page ) ),
		tempFolder: resolve( tempFolder ),
		distFolder: resolve( distFolder ),
		webpack: {
			models: models
		},
		jade: {
			type: obj.type,
			subpages: obj.subpages || [ ]
		}
	}, global.options || {} ) )
	viewTasks.push( tasks.views )
	styleTasks.push( tasks.styles )
	jsTasks.push( tasks.js )

	buildTasks.push( tasks.build )

	global.gulp.task( tasks.build, [ tasks.views, tasks.styles, tasks.js ] )

	gulp.task( 'watch-' + page, [ tasks.views, tasks.styles, tasks.js ], function () {
		global.options.development = true
		global.plugins.livereload.listen()

		gulp.watch( srcFolder + '/static/**/*', [ 'compress-images' ] )

		gulp.watch( pagesFolder + '/' + page + '/**/*.css', [ tasks.styles ] )
		gulp.watch( pagesFolder + '/' + page + '/**/*.styl', [ tasks.styles ] )
		gulp.watch( pagesFolder + '/' + page + '/**/*.jade', [ tasks.views ] )
		gulp.watch( pagesFolder + '/' + page + '/**/*.js', [ tasks.js ] )

		var allBuildFiles = [ distFolder + '/**/*' ]
		return gulp.watch( allBuildFiles, function (evt) {
			global.plugins.livereload.changed(evt.path)
		})
	})
} )
gulp.task( 'views', viewTasks )
gulp.task( 'styles', styleTasks )
gulp.task( 'js', jsTasks )

gulp.task( 'watch-web', [ 'views', 'styles', 'js' ], function () {
	global.options.development = true
	global.plugins.livereload.listen()

	gulp.watch( pagesFolder + '/static/**/*', [ 'compress-images' ] )

	gulp.watch( pagesFolder + '/**/*.css', ['styles'] )
	gulp.watch( pagesFolder + '/**/*.styl', ['styles'] )
	gulp.watch( pagesFolder + '/**/*.jade', ['views'] )
	gulp.watch( pagesFolder + '/**/*.js', ['js'] )

	var allBuildFiles = [ distFolder + '/**/*' ]
	return gulp.watch( allBuildFiles, function (evt) {
		global.plugins.livereload.changed(evt.path)
	})
})

gulp.task( 'clean-web', function (callback) {
	if ( fs.existsSync('./www/') )
		global.rimraf('./www/', callback )
	else callback()
} )

gulp.task( 'build-web', function (callback) {
	global.runSequence(
		'clean-web', buildTasks, callback
	)
} )

gulp.task( 'test-web', [] )

module.exports = {
	build: 'build-web',
	test: 'test-web'
}
