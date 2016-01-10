/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */
/* (above: Make ESLint happy about Map() not being a real constructor) */

/* globals describe, it, beforeEach */

import { fromJS } from 'immutable';
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
    const action = { type: 'START_GAME' };
    const nextState = reducer(state, action);
    const gameState = nextState.get('gameState');
    expect(gameState).to.equal(States.WAITING_FOR_DEAL);
  });

  it('handles START_NEW_HAND', () => {
    const state = fromJS({
      gameState: States.WAITING_FOR_DEAL,
      players: ['a', 'b'],
    });
    const action = { type: 'START_NEW_HAND' };
    const nextState = reducer(state, action);
    const gameState = nextState.get('gameState');
    expect(gameState).to.equal(States.WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK);
  });


  it('handles DRAW_CARD', () => {
    const state = fromJS({
      gameState: States.WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK,
      players: ['a', 'b'],
      currentPlayer: 'a',
      piles: {
        hands: {
          'a': ['2s', '3s', '4s'],
          'b': ['8c', '9c', '10c'],
        },
        draw: ['As', 'Qs'],
      },
    });
    const action = { type: 'DRAW_CARD', player: 'a' };
    const nextState = reducer(state, action);

    const gameState = nextState.get('gameState');
    const hand = nextState.getIn(['piles', 'hands', 'a']);
    const draw = nextState.getIn(['piles', 'draw']);

    expect(gameState).to.equal(States.WAITING_FOR_PLAYER_TO_DISCARD);
    expect(hand.count()).to.equal(4);
    expect(draw.count()).to.equal(1);
  });

});