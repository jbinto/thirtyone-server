/* eslint new-cap: [2, {capIsNewExceptions: ["Map"]}] */
/* (above: Make ESLint happy about Map() not being a real constructor) */

/* globals describe, it */

import { expect } from 'chai';
import { addPlayer } from '../src/game';
import { Map, List, fromJS } from 'immutable';

describe('game logic', () => {
  it('handles adding the first and second player', () => {
    const player1 = 'abcd1234';
    const player2 = 'efgh5678';

    let nextState = addPlayer(Map(), player1);
    expect(nextState).to.equal(fromJS({
      playerCount: 1,
      players: ['abcd1234'],
      gameStarted: false,
    }));

    nextState = addPlayer(nextState, player2);
    expect(nextState).to.equal(fromJS({
      playerCount: 2,
      players: ['abcd1234', 'efgh5678'],
      gameStarted: false,
    }));
  });

  it('handles adding the first and second player', () => {
    const player1 = 'abcd1234';
    const player2 = 'efgh5678';

    let nextState = addPlayer(Map(), player1);
    expect(nextState).to.equal(fromJS({
      playerCount: 1,
      players: ['abcd1234'],
      gameStarted: false,
    }));

    nextState = addPlayer(nextState, player2);
    expect(nextState).to.equal(fromJS({
      playerCount: 2,
      players: ['abcd1234', 'efgh5678'],
      gameStarted: false,
    }));
  });

  it('ignores adding players when game is started', () => {
    const state = fromJS({
      playerCount: 2,
      players: ['a', 'b'],
      gameStarted: true,
    });

    const nextState = addPlayer(state, 'c');

    expect(nextState).to.equal(state);
  });


});
