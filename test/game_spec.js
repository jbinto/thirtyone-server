/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */
/* (above: Make ESLint happy about Map() not being a real constructor) */

/* globals describe, it, beforeEach */

import { expect } from 'chai';
import { addPlayer, startGame, startNewHand, drawCard, discardCard } from '../src/game';
import { Map, List, fromJS } from 'immutable';
import * as States from '../src/game_states';


// XXX refactor pre-game into own lib/spec
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

// XXX refactor startHand etc to own lib/spec called `hand`
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

    it('sets gameState to WAITING_FOR_PLAYER_TO_DRAW', () => {
      expect(nextState.get('gameState')).to.equal(States.WAITING_FOR_PLAYER_TO_DRAW);
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

      expect(hands.get('a').count()).to.equal(3);
      expect(hands.get('b').count()).to.equal(3);
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

describe('drawCard', () => {
  const VALID_STATE = fromJS({
    gameState: States.WAITING_FOR_PLAYER_TO_DRAW,
    currentPlayer: 'a',
    players: ['a', 'b'],
    piles: {
      hands: {
        a: ['2s', '3s', '4s'],
        b: ['Qc', 'Kc', '10c'],
      },
      discard: ['As'],
      draw: ['5s', '6s', '7s'],
    },
  });

  describe('when current player', () => {
    const state = VALID_STATE;
    const nextState = drawCard(state, 'a');

    it('sets gameState to WAITING_FOR_PLAYER_TO_DISCARD', () => {
      expect(nextState.get('gameState')).to.equal(States.WAITING_FOR_PLAYER_TO_DISCARD);
    });

    it('is still current players turn', () => {
      expect(nextState.get('currentPlayer')).to.equal('a');
    });

    it('adds top draw card to the current players hand', () => {
      const actualHand = nextState.getIn(['piles', 'hands', 'a']);
      const expectedHand = List(['2s', '3s', '4s', '5s']);
      expect(actualHand).to.deep.equal(expectedHand);
    });

    it('removes the top draw card from the deck', () => {
      const actualDraw = nextState.getIn(['piles', 'draw']);
      const expectedDraw = List(['6s', '7s']);
      expect(actualDraw).to.deep.equal(expectedDraw);
    });
  });

  describe('when not current player', () => {
    const state = VALID_STATE.set(
      'currentPlayer', 'b'
    );
    const nextState = drawCard(state, 'a');
    it('does nothing', () => {
      expect(nextState).to.equal(state);
    });
  });

  // XXX refactor this into a general purpose state-validation spec
  describe('when game is not WAITING_FOR_PLAYER_TO_DRAW', () => {
    it('does nothing', () => {
      const state = VALID_STATE.set(
        'gameState', States.WAITING_FOR_PLAYER_TO_DISCARD);
      const nextState = drawCard(state, 'a');
      expect(nextState).to.equal(state);
    });
  });
});

describe('discardCard', () => {
  const VALID_STATE = fromJS({
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

  describe('when current player', () => {
    const state = VALID_STATE;
    const player = state.get('currentPlayer');
    const card = '3s';

    const nextState = discardCard(state, player, card);

    it('takes the card out of players hand', () => {
      const newHand = nextState.getIn(['piles', 'hands', player]);
      expect(newHand).to.equal(List(['2s', '4s', '5s']));
    });

    it('puts the card on top of discard', () => {
      const newDiscard = nextState.getIn(['piles', 'discard']);
      expect(newDiscard).to.equal(List(['3s', 'As']));
    });

    it('advances to the next player', () => {
      const newPlayer = nextState.get('currentPlayer');
      expect(newPlayer).to.equal('b');
    });

    // XXX: what if buddy gets 31 here??
    it('sets game state to WAITING_FOR_PLAYER_TO_DRAW', () => {
      const newGameState = nextState.get('gameState');
      expect(newGameState).to.equal(States.WAITING_FOR_PLAYER_TO_DRAW);
    });
  });

  describe('when not current player', () => {
    const state = VALID_STATE.set(
      'currentPlayer', 'b'
    );
    const nextState = discardCard(state, 'a', 'Qs');
    it('does nothing', () => {
      expect(nextState).to.equal(state);
    });
  });

  // XXX  refactor validation into different lib/spec
  describe('when game is not WAITING_FOR_PLAYER_TO_DISCARD', () => {
    it('does nothing', () => {
      const state = VALID_STATE.set(
        'gameState', States.WAITING_FOR_PLAYER_TO_DRAW);
      const nextState = discardCard(state, 'a', 'Qs');
      expect(nextState).to.equal(state);
    });
  });
});
