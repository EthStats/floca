var poststylus = require('poststylus'),
	path = require('path'),
	fs = require('fs');

var CommonsChunkPlugin = require("../node_modules/webpack/lib/optimize/CommonsChunkPlugin");

function getFiles(srcpath, extension) {
	return fs.readdirSync(srcpath).filter(function(file) {
		return file.endsWith(extension);
	});
}

module.exports = {
	createJS: function( options ){
		var taskName = 'webpack-' + options.pageName;
		var config = {
			cache: true,
			entry: {
				vendor: path.join( options.sourceFolder, 'js', 'vendor.js' ),
				main: path.join( options.sourceFolder, 'js', 'main.js' )
			},
			node: {
				fs: "empty"
			},
			output: {
				path: options.distFolder + '/js',
				filename: options.pageName + '-[name].js',
				chunkFilename: options.pageName +  '[id].js',
				publicPath: '/js/'
			},
			module: {
				noParse: [
					/Gulpfile\.js$/, /.\.json$/, /.\.txt$/, /\.gitignore$/, /\.jshintrc$/
				]
			},
			plugins: [
				new global.webpack.optimize.CommonsChunkPlugin( "vendor", options.pageName +  '-vendor.js' )
			]
		};
		if( !options.development ){
			config.plugins.push( new global.webpack.optimize.UglifyJsPlugin( ) );
			config.plugins.push( new global.webpack.optimize.OccurenceOrderPlugin() );
		}
		global.gulp.task(taskName, function( callback ) {
			global.webpack( config, function(err, stats) {
				if(err){
					throw new global.gutil.PluginError("webpack", err);
				}
				global.gutil.log("[webpack]", stats.toString({
					// output options
				}));
				callback();
			});
		});
		return taskName;
	},
	createStyles: function( options ){
		var taskName = 'styles-' + options.pageName;
		global.gulp.task(taskName, function () {
			return global.gulp.src( options.sourceFolder + '/styles/' + options.pageName + '.styl')
				.pipe( global.plugins.plumber() )
				.pipe( global.plugins.sourcemaps.init() )
				.pipe( global.plugins.stylus( {
					errors: true,
					use: [ poststylus([]) ],
					compress: !options.development,
					'include css': true
				} ) )
				.pipe( global.plugins.postcss([ ]))
				.pipe( global.plugins.autoprefixer() )
				.pipe( global.plugins.sourcemaps.write('./') )
				.pipe( global.gulp.dest( options.distFolder + '/css' ))
				.pipe( global.plugins.livereload() );
		});
		return taskName;
	},

	createViews: function( options ){
		var self = this;
		var pages = [ options.pageName ].concat( options.jade.subpages );
		var tasks = [];
		var taskName = 'views-' + options.pageName;

		pages.forEach( function( page ){
			var subTask = taskName + '-' + page;

			global.gulp.task(subTask, function( cb ){
				var YOUR_LOCALS = { mobile: options.mobile, development: options.development };
				var fileName = fs.existsSync( options.sourceFolder + '/views/' + page + '.jade' ) ? page : 'index';
				return global.gulp.src( options.sourceFolder + '/views/' + fileName + '.jade' )
					.pipe( global.plugins.plumber() )
					.pipe( global.plugins.jade( { locals: YOUR_LOCALS, pretty: options.development } ).on('error', function(err) {
						console.error(err);
					} ) )
					.pipe( global.gulp.dest( options.jade.type === 'static' ? options.distFolder : options.tempFolder ) )
					.pipe( global.plugins.livereload() );
			});
			tasks.push( subTask );
		} );

		global.gulp.task(taskName, function( cb ) {
			global.runSequence( tasks, cb );
		});
		return taskName;
	},
	createTasks: function( options ){
		var self = this;
		return {
			js: self.createJS( options ),
			views: self.createViews( options ),
			styles: self.createStyles( options ),
			build: 'build-' + options.pageName
		};
	}
};
