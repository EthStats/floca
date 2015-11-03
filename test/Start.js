var Fuser = require('../Fuser');

var fuser = new Fuser({
	entities: {
		appName: 'DemoApp',
		serviceName: 'DemoMicroService'
	}
});

fuser.start( function(){
	console.log('Started.');

	setTimeout(function(){
		fuser.stop( function(){
			console.log('Closed.');
		} );
	}, 1500);
} );
