# FLOCA
Enterprise-grade microservice architecture for NodeJS

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
- Channel-agnostic you can use any underlaying technology your application requires: AMQP, ZeroMQ, XMPP, etc...
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


## Quick setup

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

-----

In either case, the app will
- read and watch your 'bus' folder and all entities defined in it
- publish entities and endpoints you defined
- be ready to serve :)

[Back to Feature list](#features)


## Configuration

```javascript
```

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

- 0.3.0: CLI tool added.
- 0.1.0: First version released.
