# jbinto/thirtyone-server

## Project status

WIP (c. 12/2015)

## Overview

A web-based, multiplayer [Thirty-one](https://en.wikipedia.org/wiki/Thirty-one_(card_game)).

Used in conjunction with [jbinto/thirtyone-client](https://www.github.com/jbinto/thirtyone-client).

Will be playable at https://thirtyone.xyz when complete.

## Technical Overview

`thirtyone-server` is a Node.js websocket server (Socket.io) that manages game
state, and provides it to multiple React clients. It uses `redux` to manage
state on the server side.

This architecture is borrowed from [this full stack Redux tutorial](http://teropa.info/blog/2015/09/10/full-stack-redux-tutorial.html).

## Usage

TODO
