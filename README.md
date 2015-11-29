# FLOCA

Enterprise-grade microservice architecture for NodeJS

[![Join the chat at https://gitter.im/UpwardsMotion/floca](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/UpwardsMotion/floca?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

========

[floca](https://github.com/UpwardsMotion/floca) is a complete solution to aid the development of enterprise-grade applications following the microservices architectural pattern. A proven stack used by numerous of systems in production for years now.

The basic idea of [floca](https://github.com/UpwardsMotion/floca) is to provide an abstraction level allowing your project to be freed of technical layers and unnecessary decoration.
Your codebase will we required to define __only pure CommonJS modules__ and all underlaying services will be set up by [floca](https://github.com/UpwardsMotion/floca) configured by a simple JSON object.


# Features

- Proven, exceptionally featureful microservices architecture
- REST and Websockets as endpoints
- Internal services to be called by in-house entities only
- Tracking: you can monitor every message delivered (request or response) by only few lines of code
- Flow control / Reproducibility: A flow of communication / messages can be halted / continued / reinitiated anytime with no effort
- Advanced routing & listening: system fragmentation, qualified names, regular expressions, wildcards, etc.
- Channel-agnostic you can use any underlaying technology your application requires: AMQP, XMPP, etc...
- JSON Web Tokens integrated
- Built-in logging service supporting Loggly as well
- Short learning curve: no need to learn hundred of pages, communication has to be simple after all. CommonJS is all you need to understand. :)


# System model

Of course, you can orchestrate your app the way you prefer, but please let us share a possible way to build up the codebase of an EE app using [floca](https://github.com/UpwardsMotion/floca):

![alt text](https://github.com/UpwardsMotion/floca/raw/master/www/floca.png "System model")

Each microservice
- has an own repository
- possesses only just a few CommonJS definition and optional configuration file(s)
- developed by a dedicated developer.
- is functional on its own. Can be built and deployed to a cloud provider or docker image with ease.

Your code is clean, pure and surprisingly simple.


# Installation

	$ npm install -g floca


# Quick setup

#### Using the CLI tool:

	$ floca create demoApp
	$ cd demoApp
	$ npm install
	$ npm start

The CLI tool will create a new folder 'demoApp', and will create all required subfolders and files in it.
By executing those npm commands, your microservice is ready-to-serve!
The initial project will contain:
- a microservice
- a Starter code
- a preliminary package.json
- a sample config for the microservices

#### Creating own project:

```javascript
var Floca = require('floca');

var floca = new Floca({
	entities: {
		appName: 'NameOfYourApp',
		serviceName: 'NameOfYourMicroService'
	}
});

floca.start( function(){
	console.log('Started.');
} );
```

Yes, it is that simple.

Note: by default [floca](https://github.com/UpwardsMotion/floca) is using in-memory bus to relay messages. Should you consider an enterprise-grade provider, should the [AMQP](#amqp) or [NSQ](#nsq) topic reviewed.

-----

In either case, the app will
- read and watch your 'bus' folder and all entities defined in it
- publish entities and endpoints you defined
- be ready to serve :)


# Usage

- Microservice configuration [See for details](#microserviceconfiguration)
- AMQP [See for details](#amqp)
- NSQ [See for details](#nsq)
- Logging [See for details](#logging)
- JSON Web Tokens [See for details](#jsonwebtokens)
- Extender functions [See for details](#extenders)
- Own SSL certification [See for details](#ssl)
- Service configuration via service discovery [See for details](#serviceconfigurationviaservicediscovery)
- CLI [See for details](#cli)


## Microservice configuration

Each microservice must have a unique name and must belong to an application or domain. These names will be used in the message bus for routing and distinguish different fields of jurisdiction.


```javascript
{
	...
	entities: {
		folder: path.join( process.cwd(), 'bus'),
		appName: 'APP_NAME_IS_MISSING',
		serviceName: 'SERVICE_NAME_IS_MISSING',
		configurator: 'Tuner'
	}
	...
}
```

Microservices will be read from the folder defined by the attribute 'folder'. An inner entity, called 'Publisher' watches that folder and according to the changes at file-level, the micoservice entities will be republished or removed.
The folder 'bus' in the root of your project is the default spot.

The attributes 'appName' and 'serviceName' are used to identify the app and the microservice and to identify the constructs in the message bus.

if the attribute 'configurator' is present, the Publisher will use to get the initial configuration of the microservices before publishing. This way, you can have a centralised configuration microservice with a name identified by the attribute 'configurator' and all microservices within the same app can reach it and be configured by the object such microservices retrieves.
The Publisher will send a message to the configurator microservice passing the appName and serviceName and accept the JS object interpreted as configuration and passed to the microservice.


## AMQP

An enterprise-grade message bus is highly required for a microservice architecture. [AMQP](http://amqp.org) has been proven probably the most reliable message solution out there. A stunning wide range of features support your aims.
If you generated your project using the [CLI](#cli) with the option _--amqp_, then your project is set. If not, please make sure you create and pass the provider to [floca](https://github.com/UpwardsMotion/floca):

```javascript
var Fuser = require('floca');
var FuserAMQP = require('floca-amqp');
...

var fuserAMQP = new FuserAMQP();
var fuser = new Fuser( _.assign( {
	channeller: fuserAMQP,
	...
}, require('./config') ) );

```

This will tell [floca](https://github.com/UpwardsMotion/floca) to use the AMQP provider instead of the default in-memory solution.

[floca](https://github.com/UpwardsMotion/floca) tries to access a running AMQP by default specified in the config file as below:

```javascript
{
	...
	amqp: {
		connectURL: 'amqp://localhost'
	}
	...
}
```

You can set an empty string to make floca work 'offline' or specify a valid connectionURL fitting your environment.

If the following environment variables are set,  [floca](https://github.com/UpwardsMotion/floca) will respect them as configuration:

	AMQP_CONN_URL


## NSQ

If you generated your project using the [CLI](#cli) with the option _--nsq_, then your project is set. If not, please make sure you create and pass the provider to [floca](https://github.com/UpwardsMotion/floca):

```javascript
var Fuser = require('floca');
var FuserNSQ = require('floca-nsq');
...

var fuserNSQ = new FuserNSQ();
var fuser = new Fuser( _.assign( {
	channeller: fuserNSQ,
	...
}, require('./config') ) );

```

This will tell [floca](https://github.com/UpwardsMotion/floca) to use the NSQ provider instead of the default in-memory solution.

[floca](https://github.com/UpwardsMotion/floca) checks for settings for NSQ messaging solution in the config file as below:

```javascript
{
	...
	nsq: {
		nsqdHost: '127.0.0.1'
		nsqdPort: 4150
	}
	...
}
```

If the following environment variables are set,  [floca](https://github.com/UpwardsMotion/floca) will respect them as configuration:

	NSQ_HOST, NSQ_PORT


## Logging

[floca](https://github.com/UpwardsMotion/floca) supports mutliple logging solution:
- own logging service
- [loggly](http://loggly.com)
- file-based logging using [winston]()

Please see the options in priority order:

#### Own logging service

```javascript
var logger = ...;
{
	log: logger
	...
}
```

By setting the 'log' attribute to an own logger object possessing a 'log' function, [floca](https://github.com/UpwardsMotion/floca) will use it for all internal logging activity.

#### Loggly

```javascript
{
	log: {
		loggly: {
			token: '',
			subdomain: ''
		}
	}
	...
}
```

If 'loggly' attribute is present with filled values, [floca](https://github.com/UpwardsMotion/floca) will establish connection to the Loggly server and use it as logging facility.

If the following environment variables are set,  [floca](https://github.com/UpwardsMotion/floca) will respect them as configuration:

	LOGGLY_TOKEN, LOGGLY_SUBDOMAIN


#### Log to files

```javascript
{
	log: {
		level: "info",
		file: "./floca.log",
		maxsize: 10485760,
		maxFiles: 10
	}
	...
}
```

As third option, you can log into files (maybe to a shared drive on a VM accumulated by some background service) and configure the size, number of the files specifying the minimum level of interest in logging records.

!Note: support for other logging solutions is in the pipeline...

[Back to Usage](#usage)


## JSON Web Tokens

[JWT](http://jwt.io) is an open industry standard method for representing claims securely between two parties. [floca](https://github.com/UpwardsMotion/floca) has built-in support for JWT. You can activate it by adding secret key to the configuration:

```javascript
	...
	server: {
		...
		jwt: {
			key: 'x-floca-jwt',
			secret: '',
			timeout: 2 * 24 * 60 * 60,
			acquire: true
		},
		...
	}
	...
```

The attribute 'key' will be the key to be read from the header and will be added to the response as 'Access-Control-*' headers.
To support token requests, the optional attribute 'acquireURI' will activate a REST request on the given URI allowing clients to acquire a token using a simple GET request.

[Back to Usage](#usage)


## Extenders

[floca](https://github.com/UpwardsMotion/floca) allows you to insert extender functions to the setup process to extend, refine or overwrite the default behavior of floca. Extender functions have to be put to the config file.
You might not need all of them, probably none of them. See an example config file below:

```javascript
{
	connectMiddlewares: function( ){ ... },
	extendREST: function( config, rester, pathToIgnore, harcon, tools ){ ... },
	runDevelopmentTest: function( rester, harcon ){ ... }
}
```

#### connectMiddlewares

[Connect](https://github.com/senchalabs/connect#readme) delivers the HTTP server framework for [floca](https://github.com/UpwardsMotion/floca), and when it is initiated, the function _connectMiddlewares_ is searched for to extend the middleware list of connect. By default only middlewares [compression](https://github.com/expressjs/compression) and [body-parser](https://github.com/expressjs/body-parser) is used. Your neeed might evolve the presence of other middlewares like [helmet](https://github.com/helmetjs/helmet) if web pages must be provided. Your function _connectMiddlewares_ should return an array of middlewares to be used.

```javascript
	connectMiddlewares: function( ){
		return [ helmet.xframe('deny') ];
	}
```

#### extendREST

The exceptionally featureful [connect-rest](https://github.com/imrefazekas/connect-rest) is used as REST layer in [floca](https://github.com/UpwardsMotion/floca). The default behavior of floca publishes the microservices - if needed - and might publish the JWT request function. Your project might require to extend it with new REST functions like login:

```javascript
	extendREST: function( config, rester, pathToIgnore, harcon, tools ){
		rester.post( { path: '/login', context: '/sys', version: '1.0.0' }, function( request, content, callback ){
			harcon.ignite( null, '', 'DBServices.login', content.email, content.password, function(err, user){
				if( err ) return callback( err );

				sendJWTBack( user[0].uid, user[0].roles, options, callback );
			} );
		}, { options: true } );
	}
```

Tools is an object enlisting services like JWT used by the [floca](https://github.com/UpwardsMotion/floca).


#### runDevelopmentTest

[floca](https://github.com/UpwardsMotion/floca) can be started in development mode using the '--development' switch in the command line. This activates a scheduled checkup function printing out the list of published microservices and the method 'runDevelopmentTest' if present.

```javascript
	runDevelopmentTest: function( rester, harcon ){
		harcon.simpleIgnite( 'DBServices.addAdmin', function(err, res){ } );
	}
```

You might want to create documents, user records at startup time for development purposes...


[Back to Usage](#usage)


## SSL

If you possess an own SSL key, you can specify the absolute path of the key,cert file pairs in the configuration file as below:

```javascript
	...
	server: {
		...
		ssl: {
			key: path.join( process.cwd(), 'ssh', 'sign.key' ),
			cert: path.join( process.cwd(), 'ssh', 'sign.crt' )
		},
		...
	}
	...
```

[Back to Usage](#usage)


## Service configuration via service discovery

In a highly fragmented system, the configuration management should be centralised and accessed through service discovery.

```javascript
	...
	entities: {
		configurator: 'Tuner'
	},
	...
```

The attribute _'configurator'_ will activate the configuration management in [floca](https://github.com/UpwardsMotion/floca) and the microservice loader will call the function 'config' of it passing the name of the app and the service to require the configuration sent to the entity to initialise.


## CLI

[floca](https://github.com/UpwardsMotion/floca) is delivered with an embedded CLI tool to aid project creation and management.

Install floca with _-g_ switch:

	$ npm install -g floca

This will give you the _floca_ command line statement


#### Generate Project

To generate a new project execute the following:

	$ floca create <projectName> [--amqp] [--nsq]

This will create a folder _projectName_ inside the execution folder and creates a minimal viable [floca](https://github.com/UpwardsMotion/floca) project using the transport provider you might pass.
The project can be used right away:

	$ npm install
	$ npm start

Extend the bus folder with entities and have a happy coding!


#### Generate Test Mocha code

If your project possesses the service entities you might want to use, the CLI tool can generate [Mocha](https://mochajs.org) tests for them:

	$ floca generate test --mocha

This will execute a [floca](https://github.com/UpwardsMotion/floca) instance and all entities providing REST or Websocket interface will be associated with a test case.

All code will be put to the file: _test/mochaTest_

Execute this statement to call mocha on tests:

	$ mocha test/mochaTest

Tests are generated with _always accept_ behavior waiting for being unfold.


## License

(The MIT License)

Copyright (c) 2015 Upwards Motion Ltd (1st Floor, 2 Woodberry Grove, Finchley, London N12 0DR; Company Registration No: 09074890)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


## Bugs

See <https://github.com/UpwardsMotion/floca/issues>.


## Changelog

- 0.5.0: JWT integration added.
- 0.3.0: CLI tool added.
- 0.1.0: First version released.
