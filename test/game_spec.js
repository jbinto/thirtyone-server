/* eslint new-cap: [2, {capIsNewExceptions: ["Map"]}] */
/* (above: Make ESLint happy about Map() not being a real constructor) */

/* globals describe, it, beforeEach */

import { expect } from 'chai';
import { addPlayer, startGame, startNewHand, shuffle } from '../src/game';
import { Map, fromJS } from 'immutable';
import _ from 'lodash';

// n.b. BUG XXX HACK -- don't store computable data like playerCount

describe('pre-game', () => {
  it('handles adding the first and second player', () => {
    const player1 = 'abcd1234';
    const player2 = 'efgh5678';

    let nextState = addPlayer(Map(), player1);
    expect(nextState).to.equal(fromJS({
      players: ['abcd1234'],
      gameStarted: false,
    }));

    nextState = addPlayer(nextState, player2);
    expect(nextState).to.equal(fromJS({
      players: ['abcd1234', 'efgh5678'],
      gameStarted: false,
    }));
  });

  it('ignores adding players when game is started', () => {
    const state = fromJS({
      players: ['a', 'b'],
      gameStarted: true,
    });

    const nextState = addPlayer(state, 'c');

    expect(nextState).to.equal(state);
  });

  it('will not start game if only 1 player', () => {
    const state = fromJS({
      players: ['a'],
      gameStarted: false,
    });

    const nextState = startGame(state);
    expect(nextState).to.equal(state);
  });

  it('will start game if 2 players', () => {
    const state = fromJS({
      players: ['a', 'b'],
      gameStarted: false,
    });

    const nextState = startGame(state);
    expect(nextState.get('gameStarted')).to.be.true();
  });
});


describe('startNewHand', () => {
  it('does nothing if handStarted', () => {
    const state = fromJS({
      players: ['a', 'b'],
      gameStarted: true,
      handStarted: true,
    });

    const nextState = startNewHand(state);
    expect(nextState).to.deep.equal(state);
  });

  describe('2 player game', () => {
    let state;
    let nextState;
    let piles;

    beforeEach(() => {
      state = fromJS({
        players: ['a', 'b'],
        gameStarted: true,
      });

      nextState = startNewHand(state);

      piles = nextState.get('piles');
    });

    it('sets gameState to WAITING_PLAYER_DRAW', () => {
      expect(nextState.get('gameState')).to.equal('WAITING_PLAYER_DRAW');
    });

    it('sets handStarted and currentPlayer', () => {
      expect(nextState.get('handStarted')).to.be.true();
      expect(nextState.get('currentPlayer')).to.equal(
        nextState.get('players').first()
      );
    });

    it('populates piles.hands with 2 arrays of 3 cards', () => {
      const hands = piles.get('hands');

      expect(piles.count()).to.equal(3);
      expect(hands.count()).to.equal(2);

      expect(hands.first().count()).to.equal(3);
      expect(hands.last().count()).to.equal(3);
    });

    it('populates piles.discard with an array of 1 single card', () => {
      const discard = piles.get('discard');
      expect(discard.count()).to.equal(1);
    });

    it('populates piles.draw with the remaining cards', () => {
      const draw = piles.get('draw');
      expect(draw.count()).to.equal(52 - 3 - 3 - 1); // 45
    });
  });
});

describe('shuffle', () => {
  let original;
  beforeEach(() => {
    original = _.range(0, 100);
  });

  it('shuffle doesnt mutate the array', () => {
    const copy = _.clone(original);
    shuffle(original); // no-op
    expect(original).to.deep.equal(copy);
  });

  it('shuffle does return a new order', () => {
    // XXX Technically this test is non-determistic
    // There is, theoretically, a 1/100! chance that the array shuffles
    // back to the original.
    // (100! = 93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000)
    const shuffled = shuffle(original);
    expect(shuffled).not.to.deep.equal(original);
  });
});
