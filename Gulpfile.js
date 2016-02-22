var gulp = require('gulp'),
	plugins = require('gulp-load-plugins')( { scope: ['devDependencies'] } )

gulp.task( 'eslint', function (callback) {
	return gulp.src( ['./lib/**/*.js', './generator/**/*.js', './*.js' ] )
		.pipe( plugins.eslint() )
		.pipe( plugins.eslint.format() )
		.pipe( plugins.eslint.failOnError() )
} )

gulp.task( 'mocha', function (callback) {
	return gulp.src( './test/*.mocha.js' ).pipe( plugins.mocha({reporter: 'nyan'}) )
} )

gulp.task( 'doc', function (callback) {
	var doccoOptions
	return 	gulp.src('./test/mochaTest.js')
			.pipe( plugins.docco( doccoOptions ) )
			.pipe( gulp.dest('./doc') )
} )

gulp.task( 'default', ['eslint', 'mocha', 'doc'] )
