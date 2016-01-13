/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */
/* (above: Make ESLint happy about Map() not being a real constructor) */

/* globals describe, it, beforeEach */

import { fromJS } from 'immutable';
import { expect } from 'chai';
import reducer from '../src/reducer';
import { States } from '../src/constants';

describe('reducer', () => {
  describe('individual actions', () => {
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

    it('handles DRAW_DISCARD', () => {
      const state = fromJS({
        gameState: States.WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK,
        players: ['a', 'b'],
        currentPlayer: 'a',
        piles: {
          hands: {
            'a': ['2s', '3s', '4s'],
            'b': ['8c', '9c', '10c'],
          },
          discard: ['As', 'Qs'],
        },
      });
      const action = { type: 'DRAW_DISCARD', player: 'a' };
      const nextState = reducer(state, action);

      const gameState = nextState.get('gameState');
      const hand = nextState.getIn(['piles', 'hands', 'a']);
      const discard = nextState.getIn(['piles', 'discard']);

      expect(gameState).to.equal(States.WAITING_FOR_PLAYER_TO_DISCARD);
      expect(hand.count()).to.equal(4);
      expect(discard.count()).to.equal(1);
    });

    it('handles DISCARD_CARD', () => {
      const state = fromJS({
        gameState: States.WAITING_FOR_PLAYER_TO_DISCARD,
        players: ['a', 'b'],
        currentPlayer: 'a',
        piles: {
          hands: {
            'a': ['2s', '3s', '4s', '5s'],
            'b': ['8c', '9c', '10c'],
          },
          discard: ['As'],
        },
      });
      const action = {
        type: 'DISCARD_CARD',
        player: 'a',
        card: '2s',
      };
      const nextState = reducer(state, action);

      const gameState = nextState.get('gameState');
      const hand = nextState.getIn(['piles', 'hands', 'a']);
      const discard = nextState.getIn(['piles', 'discard']);
      const currentPlayer = nextState.get('currentPlayer');

      expect(gameState).to.equal(States.WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK);
      expect(hand.count()).to.equal(3);
      expect(discard.count()).to.equal(2);
      expect(currentPlayer).to.equal('b');
    });

    it('handles KNOCK', () => {
      const state = fromJS({
        gameState: States.WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK,
        players: ['a', 'b'],
        currentPlayer: 'a',
      });
      const action = {
        type: 'KNOCK',
        player: 'a',
      };
      const nextState = reducer(state, action);
      expect(nextState.get('knockedByPlayer')).to.equal('a');
      expect(nextState.get('currentPlayer')).to.equal('b');
    });
  });


  describe('compund actions', () => {
    it('via reduce', () => {
      const actions = [
        { type: 'ADD_PLAYER', player: 'John' },
        { type: 'ADD_PLAYER', player: 'Susan' },
        { type: 'START_GAME' },
        { type: 'START_NEW_HAND' },
        { type: 'DRAW_CARD', player: 'John' },
      ];

      // XXX technically this is non-deterministic
      // User could have 31 off the bat, or after drawing.
      // Need a way to inject a custom deck to make this deterministic.

      const finalState = actions.reduce(reducer, undefined);

      const gameState = finalState.get('gameState');
      const hand = finalState.getIn(['piles', 'hands', 'John']);

      expect(gameState).to.equal(States.WAITING_FOR_PLAYER_TO_DISCARD);
      expect(hand.count()).to.equal(4);
    });
  });
});
