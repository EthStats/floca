#! /usr/bin/env node

var configServices = require('./ConfigServices').env().argv();

var config = configServices.config();

console.log('filesearch');
