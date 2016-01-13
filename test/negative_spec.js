/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */
/* (above: Make ESLint happy about Map() not being a real constructor) */

/* globals describe, it, beforeEach */

import { expect } from 'chai';
import {
  addPlayer,
  startGame,
  startNewHand,
  drawCard,
  drawDiscard,
  discardCard,
  knock,
  _endHandForKnock
} from '../src/game';
import { fromJS } from 'immutable';
import { States } from '../src/constants';

describe('negative', () => {
  describe('(-) pre-game', () => {
    it('ignores adding players when game is started', () => {
      const state = fromJS({
        gameState: States.WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK,
        players: ['a', 'b'],
      });

      const nextState = addPlayer(state, 'c');
      expect(nextState).to.equal(state);
    });
  });

  it('will not start game if only 1 player', () => {
    const state = fromJS({
      gameState: States.WAITING_FOR_NEW_PLAYERS_OR_START_GAME,
      players: ['a'],
    });

    const nextState = startGame(state);
    expect(nextState).to.equal(state);
  });


  describe('(-) startNewHand', () => {
    it('does nothing if handStarted', () => {
      const state = fromJS({
        gameState: States.WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK,
        players: ['a', 'b'],
        handStarted: true,
      });

      const nextState = startNewHand(state);
      expect(nextState).to.deep.equal(state);
    });
  });

  describe('(-) when not current player', () => {
    const state = fromJS({
      gameState: States.WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK,
      currentPlayer: 'a',
      players: ['a', 'b'],
    });
    const wrongPlayer = 'b';

    it('drawCard does nothing', () => {
      const nextState = drawCard(state, wrongPlayer);
      expect(nextState).to.equal(state);
    });

    it('drawDiscard does nothing', () => {
      const nextState = drawCard(state, wrongPlayer);
      expect(nextState).to.equal(state);
    });

    it('discardCard does nothing', () => {
      const nextState = discardCard(state, wrongPlayer, 'Qs');
      expect(nextState).to.equal(state);
    });

    it('knock does nothing', () => {
      const nextState = knock(state, wrongPlayer);
      expect(nextState).to.equal(state);
    });
  });

  describe('(-) when invalid player', () => {
    const state = fromJS({
      gameState: States.WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK,
      currentPlayer: 'a',
      players: ['a', 'b'],
    });
    const invalidPlayer = 'c';

    it('drawCard does nothing', () => {
      const nextState = drawCard(state, invalidPlayer);
      expect(nextState).to.equal(state);
    });

    it('drawDiscard does nothing', () => {
      const nextState = drawCard(state, invalidPlayer);
      expect(nextState).to.equal(state);
    });

    it('discardCard does nothing', () => {
      const nextState = discardCard(state, invalidPlayer, 'Qs');
      expect(nextState).to.equal(state);
    });

    it('knock does nothing', () => {
      const nextState = knock(state, invalidPlayer);
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

    it('startGame does nothing', () => {
      const nextState = startGame(badState);
      expect(nextState).to.equal(badState);
    });

    it('drawCard does nothing', () => {
      const nextState = drawCard(badState, player);
      expect(nextState).to.equal(badState);
    });

    it('drawDiscard does nothing', () => {
      const nextState = drawDiscard(badState, player);
      expect(nextState).to.equal(badState);
    });

    it('discardCard does nothing', () => {
      const nextState = discardCard(badState, player, 'Qs');
      expect(nextState).to.equal(badState);
    });

    it('knock does nothing', () => {
      const nextState = knock(badState, player);
      expect(nextState).to.equal(badState);
    });

    it('_endHandForKnock does nothing', () => {
      // XXX shouldn't really be testing private api
      // but code coverage tool said I should :(
      const nextState = _endHandForKnock(badState);
      expect(nextState).to.equal(badState);
    });
  });


  // XXX REMOVE ME - this is not even a possible circumstance
  describe('(-) when discard pile is empty', () => {
    const state = fromJS({
      gameState: States.WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK,
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
