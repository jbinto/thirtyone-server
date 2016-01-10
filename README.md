# jbinto/thirtyone-server

[![Build Status](https://travis-ci.org/jbinto/thirtyone-server.svg?branch=master)](https://travis-ci.org/jbinto/thirtyone-server) [![Coverage Status](https://coveralls.io/repos/jbinto/thirtyone-server/badge.svg?branch=master)](https://coveralls.io/r/jbinto/thirtyone-server?branch=master) [![Dependency Status](https://gemnasium.com/jbinto/thirtyone-server.svg)](https://gemnasium.com/jbinto/thirtyone-server)

## Overview

A web-based, multiplayer [Thirty-one](https://en.wikipedia.org/wiki/Thirty-one_(card_game)).

Used in conjunction with [jbinto/thirtyone-client](https://www.github.com/jbinto/thirtyone-client).

Will be playable at https://thirtyone.xyz when complete.


## Project status

WIP (c. 1/2016)

Server - 80% implemented

Client - 0% implemented

## Technical Overview

`thirtyone-server` is a Node.js websocket server (Socket.io) that manages game
state, and provides it to multiple React clients. It uses `redux` to manage
state on the server side. State is maintained internally as a collection of
Immutable.js `Map` and `List` objects.

This architecture is borrowed from [this full stack Redux tutorial](http://teropa.info/blog/2015/09/10/full-stack-redux-tutorial.html).

Development tooling includes:

* Unit testing: `mocha`, `chai`
* Continuous integration: `travis-ci`
* Code coverage: `istanbul`, `coveralls`
* Linting: `eslint`, `eslint-config-airbnb`
* Dependency tracking: [Gemnasium](https://gemnasium.com/)

## Usage

### Starting server

TODO

### Running tests

* `npm run test`
* `npm run test:watch`
* `npm run test:nocoverage` will skip istanbul code coverage.

On each test run, a test coverage report will be output to `./coverage`.

Travis builds (i.e. every Github push) will trigger a Coveralls coverage report.

## Documentation

* JSDoc - TODO
* [Development notes](https://github.com/jbinto/thirtyone-server/NOTES.md)
