/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */
/* (above: Make ESLint happy about Map() not being a real constructor) */

/* globals describe, it, beforeEach */

import { expect } from 'chai';
import { fromJS } from 'immutable';
import _ from 'lodash';
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

  describe('shuffle', () => {
    let original;
    beforeEach(() => {
      original = _.range(0, 100);
    });

    it('shuffle doesnt mutate the array', () => {
      const copy = _.clone(original);
      Utils.shuffle(original); // no-op
      expect(original).to.deep.equal(copy);
    });

    it('shuffle does return a new order', () => {
      // XXX Technically this test is non-determistic
      // There is, theoretically, a 1/100! chance that the array shuffles
      // back to the original.
      // (100! = 93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000)
      const shuffled = Utils.shuffle(original);
      expect(shuffled).not.to.deep.equal(original);
    });
  });
});
