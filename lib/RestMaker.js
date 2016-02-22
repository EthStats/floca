function sendTokenBack ( uid, roles, options, callback ) {
	var token = options.jwt.sign(
		{ issueDate: Date.now(), uid: uid, roles: roles },
		options.jwtConfig.secret,
		{ expiresIn: options.jwtConfig.timeout }
	)
	var headers = {}
	headers[ options.jwtConfig.key ] = token
	callback( null, { message: 'Done.' }, { contentType: 'text/html', headers: headers } )
}

exports.buildUp = function ( radiation, rest, harcon, options ) {
	options.pathToIgnore.push( options.jwtConfig.acquireURI )

	var context = '', path = options.jwtConfig.acquireURI
	var separatorIndex = options.jwtConfig.acquireURI.lastIndexOf( '/' )
	if ( separatorIndex > 0 ) {
		context = options.jwtConfig.acquireURI.substring( 0, separatorIndex )
		path = options.jwtConfig.acquireURI.substring( separatorIndex )
	}
	rest.get( { path: path, context: context, version: '1.0.0' }, function ( request, content, callback ) {
		sendTokenBack( 0, [ 'guest' ], options, callback )
	}, { options: true } )
}
