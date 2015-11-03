if( !process.env.WARPER_APP_NAME )
	process.env.WARPER_APP_NAME = 'Warper-Dev';
if( !process.env.WARPER_SERVICE_NAME )
	process.env.WARPER_SERVICE_NAME = 'void';
if( !process.env.WARPER_CLOUD_LOGGING )
	process.env.WARPER_CLOUD_LOGGING = true;

var configServices = require('../ConfigServices').env().argv();
var config = global.config = configServices.config();

var configs = [
	'./server/config/service'
];
if( config.development ){
	configs.push( './server/config/serviceDev' );
}
configServices.file( configs );

var Server = require('./Server');
var server = new Server( );

server.init( function(err){
	if( err ){ console.error(err); return server.close(); }
	server.serve();
});
