#! /usr/bin/env node

var Executer = require('./Executer');

Executer.execute.apply( Executer, process.argv.slice( 2 ) );
