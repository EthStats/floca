function sendTokenBack( uid, roles, options, callback ){
	var token = options.jwt.sign(
		{ issueDate: Date.now(), uid: uid, roles: roles },
		global.config.service.jwt.secret,
		{ expiresIn: global.config.service.jwt.timeout }
	);
	var headers = {};
	headers[ global.config.service.jwt.key ] = token;
	callback( null, { message: 'Done.' }, { contentType: 'text/html', headers: headers } );
}

exports.buildUp = function( radiation, rest, harcon, options ){
	options.pathToIgnore.push( '/sys/request-token' );

	rest.get( { path: '/request-token', context: '/sys', version: '1.0.0' }, function( request, content, callback ){
		sendTokenBack( 0, [ 'guest' ], options, callback );
	}, { options: true } );
};
