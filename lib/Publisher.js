var fs = require('fs');
var mkdirp = require('mkdirp');

var path = require('path');

module.exports = {
	name: 'Publisher',
	context: 'Inflicter',
	files: [],
	init: function (options) {
		if( !this.configs )
			this.configs = {};

		if( !this.globalConfig )
			this.globalConfig = {};

		this.watchers = [];
		this.intervalObjects = [];
	},
	addGlobalConfig: function( config ){
		this.init();

		this.globalConfig = config;
	},
	addConfig: function( name, config ){
		this.init();

		this.configs[name] = config;
	},
	scheduleFile: function( folder, fileName ){
		var path = folder ? folder + '/' + fileName : fileName;
		if( this.files.indexOf( path ) === -1 )
			this.files.push( path );
	},
	igniteFiles: function( ){
		var self = this;
		var newFiles = self.files.slice();
		self.files.length = 0;
		newFiles.forEach( function(newFile){
			var fn = function(err, res){
				if( err ){
					console.error( err, newFile );
					self.inflicterContext.logger.error( 'Failed to publish', newFile, err );
				}
			};
			if( fs.existsSync( newFile ) ){
				var component = require( newFile.substring( 0, newFile.length-3 ) );
				if( !component.name ) return;
				if( !component.adequate || component.adequate() ){
					self.inflicterContext.logger.info( 'Publishing', component.name );
					self.ignite( self.globalConfig.entities.configurator+'.config', self.globalConfig.entities.appName, component.name, function(err, config){
						self.ignite( 'Inflicter.addicts', component, config || self.configs[component.name] || self.globalConfig[component.name], fn );
					});
				}
			} else
				self.ignite( 'Inflicter.detracts', path.basename( newFile, '.js'), fn );
		} );
	},
	readFiles: function( folder, matcher, callback ){
		var self = this;
		fs.readdir(folder, function(err, files){
			if(err)
				console.error( err );
			else {
				for(var i=0; i<files.length; i+=1)
					if( matcher(files[i]) )
						self.scheduleFile( folder, files[i] );
			}
			if( callback )
				callback();
		});
	},
	watchAll: function( folders, timeout, pattern ) {
		var self = this;
		folders.forEach(function(folder){
			self.watch( folder, timeout, pattern );
		});
	},
	watch: function( folder, timeout, pattern, callback ) {
		var self = this;
		var extension = '.js';
		var matcher = function(filePath){ return pattern ? pattern.test(filePath) : filePath.endsWith( extension ); };

		self.close();

		if( !fs.existsSync( folder ) )
			mkdirp.sync( folder );

		self.files = [];

		var isComponent = function(filePath) {
			return !fs.stat( filePath ).isDirectory() && matcher(filePath);
		};
		self.readFiles( folder, matcher, function(){
			self.watchers.push(
				fs.watch( folder, { persistent: true, recursive: true }, function(event, filename){
					var mFile = path.join( folder, filename );
					if( isComponent( mFile ) && fs.existsSync( mFile ) )
						self.scheduleFile( null, mFile );
				})
			);

			if( timeout && timeout > 0 )
				self.intervalObjects.push( setInterval( function(){ self.igniteFiles( ); }, timeout ) );
			else
				self.igniteFiles( );

			if( callback )
				callback();
		});
	},
	close: function( callback ) {
		this.watchers.forEach(function( watcher ){
			watcher.close();
		});
		this.watchers.length = 0;

		this.intervalObjects.forEach(function( intervalObject ){
			clearInterval( intervalObject );
		});
		this.intervalObjects.length = 0;

		if( callback )
			callback( null, 'Stopped' );
	}
};
