/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */
/* (above: Make ESLint happy about Map() not being a real constructor) */

/* globals describe, it, beforeEach */

import { expect } from 'chai';
import { addPlayer, startGame, startNewHand, drawCard, drawDiscard, discardCard } from '../src/game';
import { fromJS } from 'immutable';

describe('negative', () => {
  describe('(-) pre-game', () => {
    // XXX these checks were implemented before gameState
    // XXX add some states like WAITING_FOR_ENOUGH_PLAYERS
    // and WAITING_FOR_START_GAME
    it('ignores adding players when game is started', () => {
      const state = fromJS({
        players: ['a', 'b'],
        gameStarted: true,
      });

      const nextState = addPlayer(state, 'c');
      expect(nextState).to.equal(state);
    });
  });

  it('will not start game if only 1 player', () => {
    const state = fromJS({
      players: ['a'],
      gameStarted: false,
    });

    const nextState = startGame(state);
    expect(nextState).to.equal(state);
  });


  describe('(-) startNewHand', () => {
    it('does nothing if handStarted', () => {
      const state = fromJS({
        players: ['a', 'b'],
        gameStarted: true,
        handStarted: true,
      });

      const nextState = startNewHand(state);
      expect(nextState).to.deep.equal(state);
    });
  });

  describe('(-) when not current player', () => {
    const state = fromJS({
      gameState: 'WAITING_FOR_PLAYER_TO_DRAW',
      currentPlayer: 'a',
      players: ['a', 'b'],
    });
    const wrongPlayer = 'b';

    it('drawCard does nothing', () => {
      const nextState = drawCard(state, wrongPlayer);
      expect(nextState).to.equal(state);
    });

    it('discardCard does nothing', () => {
      const nextState = discardCard(state, wrongPlayer, 'Qs');
      expect(nextState).to.equal(state);
    });
  });

  describe('(-) when gameState is wrong', () => {
    const badState = fromJS({
      gameState: 'WAITING_FOR_POKER',
      currentPlayer: 'a',
      players: ['a', 'b'],
    });
    const player = 'a';

    it('drawCard does nothing', () => {
      const nextState = drawCard(badState, player);
      expect(nextState).to.equal(badState);
    });

    it('discardCard does nothing', () => {
      const nextState = discardCard(badState, player, 'Qs');
      expect(nextState).to.equal(badState);
    });
  });

  describe('(-) when discard pile is empty', () => {
    const state = fromJS({
      gameState: 'WAITING_FOR_PLAYER_TO_DRAW',
      currentPlayer: 'a',
      players: ['a', 'b'],
      piles: {
        hands: {
          a: ['2s', '3s', '4s'],
          b: ['Qc', 'Kc', '10c'],
        },
        discard: [],
        draw: ['5s', '6s', '7s'],
      },
    });
    const player = 'a';

    it('drawDiscard does nothing', () => {
      const nextState = drawDiscard(state, player);
      expect(nextState).to.equal(state);
    });
  });
});
