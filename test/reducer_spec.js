/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */
/* (above: Make ESLint happy about Map() not being a real constructor) */

/* globals describe, it, beforeEach */

import { Map, List, fromJS } from 'immutable'
import { expect } from 'chai';
import reducer from '../src/reducer';
import * as States from '../src/game_states';

describe('reducer', () => {
  it('handles ADD_PLAYER', () => {
    const state = undefined;
    const action = {
      type: 'ADD_PLAYER',
      player: 'a',
    };
    const nextState = reducer(state, action);
    expect(nextState).to.equal(fromJS({
      gameState: States.WAITING_FOR_NEW_PLAYERS_OR_START_GAME,
      players: ['a'],
    }));
  });

  it('handles START_GAME', () => {
    const state = fromJS({
      gameState: States.WAITING_FOR_NEW_PLAYERS_OR_START_GAME,
      players: ['a', 'b'],
    });
    const action = {
      type: 'START_GAME',
    };
    const nextState = reducer(state, action);
    const gameState = nextState.get('gameState');
    expect(gameState).to.equal(States.WAITING_FOR_DEAL);
  });
});
