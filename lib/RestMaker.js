'use strict'

function sendTokenBack ( uid, roles, options, callback ) {
	let token = options.jwt.sign(
		{ issueDate: Date.now(), uid: uid, roles: roles },
		options.jwtConfig.secret,
		{ expiresIn: options.jwtConfig.timeout, algorithm: options.jwtConfig.algorithm || 'HS384' }
	)
	let headers = {}
	headers[ options.jwtConfig.key ] = token
	callback( null, { message: 'Done.' }, { contentType: 'text/html', headers: headers } )
}

/*
{
	rest: {
		harconRPC: self.options.rest.harconrpcPath,
		jsonRPC: self.options.rest.jsonrpcPath,
		mappings: self.options.rest.ignoreRESTPattern ? null : (self.REST || [])
	},
	websocket: {
		harconRPC: self.options.websocket.socketPath,
		jsonRPC: self.options.websocket.jsonrpcPath,
		mappings: self.Websocket || []
	}
}
*/

exports.apiDocs = function ( radiation, rest, harcon, options ) {
	options.pathToIgnore.push( options.context + options.path )
	rest.get( { path: options.path, context: options.context, version: '1.0.0' }, function (request, content, callback) {
		radiation.entityURIs( callback )
	}, { contentType: 'text/html' } )
}
exports.buildUp = function ( radiation, rest, harcon, options ) {
	options.pathToIgnore.push( options.jwtConfig.acquireURI )

	let context = '', path = options.jwtConfig.acquireURI
	let separatorIndex = options.jwtConfig.acquireURI.lastIndexOf( '/' )
	if ( separatorIndex > 0 ) {
		context = options.jwtConfig.acquireURI.substring( 0, separatorIndex )
		path = options.jwtConfig.acquireURI.substring( separatorIndex )
	}
	rest.get( { path: path, context: context, version: '1.0.0' }, function ( request, content, callback ) {
		sendTokenBack( 0, [ 'guest' ], options, callback )
	}, { options: true } )
}
