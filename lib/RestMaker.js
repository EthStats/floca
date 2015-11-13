function sendTokenBack( uid, roles, options, callback ){
	var token = options.jwt.sign(
		{ issueDate: Date.now(), uid: uid, roles: roles },
		global.config.server.jwt.secret,
		{ expiresIn: global.config.server.jwt.timeout }
	);
	var headers = {};
	headers[ global.config.server.jwt.key ] = token;
	callback( null, { message: 'Done.' }, { contentType: 'text/html', headers: headers } );
}

exports.buildUp = function( radiation, rest, harcon, options ){
	options.pathToIgnore.push( options.acquireURI );

	var context = '', path = options.acquireURI;
	var separatorIndex = options.acquireURI.lastIndexOf( '/' );
	if( separatorIndex > 0 ){
		context = options.acquireURI.substring( 0, separatorIndex );
		path = options.acquireURI.substring( separatorIndex );
	}
	rest.get( { path: path, context: context, version: '1.0.0' }, function( request, content, callback ){
		sendTokenBack( 0, [ 'guest' ], options, callback );
	}, { options: true } );
};
