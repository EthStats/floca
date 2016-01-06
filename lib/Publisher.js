var fs = require('fs');
var mkdirp = require('mkdirp');

var path = require('path');

var async = require('async');

module.exports = {
	name: 'Publisher',
	context: 'Inflicter',
	files: [],
	init: function (options) {
		this.options = options;
		if( !this.configs )
			this.configs = {};

		if( !this.globalConfig )
			this.globalConfig = {};

		if( !this.watchers )
			this.watchers = [];
		if( !this.intervalObjects )
			this.intervalObjects = [];
	},
	setHarcon: function( harcon ){
		this.harcon = harcon;

		return this;
	},
	addGlobalConfig: function( config ){
		this.init();

		this.globalConfig = config;

		return this;
	},
	addConfig: function( name, config ){
		this.init();

		this.configs[name] = config;

		return this;
	},
	scheduleFile: function( folder, fileName ){
		var path = folder ? folder + '/' + fileName : fileName;
		if( this.files.indexOf( path ) === -1 )
			this.files.push( path );
	},
	igniteFiles: function( callback ){
		var self = this;
		var newFiles = self.files.slice();
		self.files.length = 0;

		var fns = [];
		newFiles.forEach( function(newFile){
			fns.push( function(cb){
				if( fs.existsSync( newFile ) ){
					var component = require( newFile.substring( 0, newFile.length-3 ) );
					if( !component.name ) return cb();
					if( !component.adequate || component.adequate() ){
						self.inflicterContext.logger.info( 'Publishing', component.name );
						if( self.globalConfig.floca.configurator )
							self.ignite( self.globalConfig.floca.configurator + '.' + (self.options.configFn || 'getConfigFor'), self.globalConfig.floca.appName, component.name, function(err, config){
								self.harcon.addicts( component, config || self.configs[component.name] || self.globalConfig[component.name], cb );
							});
						else
							self.harcon.addicts( component, self.configs[component.name] || self.globalConfig[component.name], cb );
					}
				} else
					self.harcon.detracts( path.basename( newFile, '.js'), cb );
			} );
		});
		async.series( fns, function(err, res){
			if( callback )
				callback( err, res );
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

		var isComponent = function( filePath ) {
			try{
				return !fs.lstatSync( filePath ).isDirectory() && matcher(filePath);
			} catch(err){ return false; }
		};
		self.readFiles( folder, matcher, function(){
			self.igniteFiles( callback );
			if( timeout && timeout > 0 ){
				self.watchers.push(
					fs.watch( folder, { persistent: true, recursive: true }, function(event, filename){
						var mFile = path.join( folder, filename );
						if( isComponent( mFile ) && fs.existsSync( mFile ) )
							self.scheduleFile( null, mFile );
					})
				);
				self.intervalObjects.push( setInterval( function(){ self.igniteFiles( ); }, timeout ) );
			}
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
