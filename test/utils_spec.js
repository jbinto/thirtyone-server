/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */
/* (above: Make ESLint happy about Map() not being a real constructor) */

/* globals describe, it, beforeEach */

import { expect } from 'chai';
import { fromJS, List } from 'immutable';
import _ from 'lodash';
import * as Utils from '../src/utils';
import { States, DEFAULT_DECK } from '../src/constants';

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

  describe('getShuffledDeck', () => {
    const deck = Utils.getShuffledDeck();
    const defaultDeck = List(DEFAULT_DECK);

    it('returns a different deck (ordering) than default', () => {
      expect(deck).to.not.equal(defaultDeck);
    });

    it('when resorted, is same as the default deck', () => {
      expect(deck.sort()).to.equal(defaultDeck.sort());
    });
  });
});

describe('filterStateTree', () => {
  describe('by player', () => {
    const state = fromJS({
      gameState: States.WAITING_FOR_PLAYER_TO_DISCARD,
      currentPlayer: 'a',
      players: ['a', 'b'],
      piles: {
        hands: {
          a: ['2s', '3s', '4s', '5s'],
          b: ['Qc', 'Kc', '10c'],
        },
        discard: ['As'],
        draw: ['6s', '7s'],
      },
    });
    const player = 'a';
    const filteredState = Utils.filterStateTree(state, player);

    it('filters out piles', () => {
      const piles = filteredState.get('piles');
      expect(piles).to.be.undefined();
    });

    it('populates hand from piles.hands.[player]', () => {
      const expectedHand = List(['2s', '3s', '4s', '5s']);
      const hand = filteredState.get('hand');
      expect(hand).to.equal(expectedHand);
    });

    it('populates topDiscard from piles.hands.discard.first', () => {
      const expected = 'As';
      const topDiscard = filteredState.get('topDiscard');
      expect(topDiscard).to.equal(expected);
    });
  });
});
