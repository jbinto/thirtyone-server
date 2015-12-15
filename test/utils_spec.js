/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */
/* (above: Make ESLint happy about Map() not being a real constructor) */

/* globals describe, it */

import { expect } from 'chai';
import { fromJS } from 'immutable';
import * as Utils from '../src/utils';


describe('utils', () => {
  describe('getNextPlayer', () => {
    it('gets the next player in sequence', () => {
      const players = ['a', 'b'];
      const currentPlayer = 'a';
      const nextPlayer = Utils.getNextPlayer(players, currentPlayer);
      expect(nextPlayer).to.equal('b');
    });

    it('loops around the array', () => {
      const players = ['a', 'b', 'c', 'd'];
      const currentPlayer = 'd';
      const nextPlayer = Utils.getNextPlayer(players, currentPlayer);
      expect(nextPlayer).to.equal('a');
    });

    it('returns null if bogus currentPlayer', () => {
      const players = ['a', 'b', 'c', 'd'];
      const currentPlayer = 'e';
      const nextPlayer = Utils.getNextPlayer(players, currentPlayer);
      expect(nextPlayer).to.equal(null);
    });
  });

  describe('advanceCurrentPlayer', () => {
    it('updates state', () => {
      const state = fromJS({
        players: ['a', 'b', 'c'],
        currentPlayer: 'c',
      });
      const nextState = Utils.advanceCurrentPlayer(state);
      expect(nextState.get('currentPlayer')).to.equal('a');
    });
  });
});
