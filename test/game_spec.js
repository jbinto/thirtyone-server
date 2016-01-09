/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */
/* (above: Make ESLint happy about Map() not being a real constructor) */

/* globals describe, it, beforeEach */

// NOTE: To keep this file readable, only put happy-case tests here.
// For now, negative/validation specs are in `negative_spec.js`

import { expect } from 'chai';
import {
  addPlayer,
  startGame,
  startNewHand,
  drawCard,
  drawDiscard,
  discardCard,
  knock,
} from '../src/game';
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

    it('sets gameState to WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK', () => {
      expect(nextState.get('gameState')).to.equal(States.WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK);
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
    gameState: States.WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK,
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

  describe('from draw pile', () => {
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

  describe('from discard pile', () => {
    const state = VALID_STATE;
    const nextState = drawDiscard(state, 'a');

    it('sets gameState to WAITING_FOR_PLAYER_TO_DISCARD', () => {
      expect(nextState.get('gameState')).to.equal(States.WAITING_FOR_PLAYER_TO_DISCARD);
    });

    it('is still current players turn', () => {
      expect(nextState.get('currentPlayer')).to.equal('a');
    });

    it('adds top discard card to the current players hand', () => {
      const actualHand = nextState.getIn(['piles', 'hands', 'a']);
      const expectedHand = List(['2s', '3s', '4s', 'As']);
      expect(actualHand).to.deep.equal(expectedHand);
    });

    it('removes the top card from the discard pile', () => {
      const actualDraw = nextState.getIn(['piles', 'discard']);
      const expectedDraw = List([]);
      expect(actualDraw).to.deep.equal(expectedDraw);
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

  const state = VALID_STATE;
  const player = state.get('currentPlayer');
  const validCard = '3s';

  describe('when current player', () => {
    const nextState = discardCard(state, player, validCard);

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
    it('sets game state to WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK', () => {
      const newGameState = nextState.get('gameState');
      expect(newGameState).to.equal(States.WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK);
    });
  });

  describe('when bogus card (not in players hand)', () => {
    it('does nothing', () => {
      const invalidCard = 'Qc';
      const newGameState = discardCard(state, player, invalidCard);
      expect(newGameState).to.equal(state);
    });
  });
});

describe('thirtyOne', () => {
  const state = fromJS({
    gameState: States.WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK,
    currentPlayer: 'a',
    players: ['a', 'b'],
    piles: {
      hands: {
        a: ['10s', 'Js', '4s'],
        b: ['Qc', 'Kc', '10c'],
      },
      discard: ['As'],
      draw: ['6s', '7s'],
    },
  });
  const player = 'a';

  it('is declared after draw when hand scores 31 points', () => {
    const nextState = drawDiscard(state, player);
    const expectedState = fromJS({
      gameState: States.THIRTY_ONE,
      winner: 'a',
      players: ['a', 'b'],
      piles: {
        hands: {
          a: ['10s', 'Js', '4s', 'As'],
          b: ['Qc', 'Kc', '10c'],
        },
        discard: [],
        draw: ['6s', '7s'],
      },
    });
    expect(nextState).to.equal(expectedState);
  });
});

describe('knock: ', () => {
  describe('when player knocks, ', () => {
    const state = fromJS({
      gameState: States.WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK,
      currentPlayer: 'a',
      players: ['a', 'b'],
      piles: {
        hands: {
          a: ['10s', 'Js', '4s'],
          b: ['Qc', 'Kc', '10c'],
        },
        discard: ['As'],
        draw: ['6s', '7s'],
      },
    });

    const nextState = knock(state, 'a');

    it('sets knockedByPlayer to current player', () => {
      expect(nextState.get('knockedByPlayer'))
        .to.equal('a');
    });

    it('advances to the next player', () => {
      expect(nextState.get('currentPlayer'))
        .to.equal('b');
    });

    it('sets gameState to WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK', () => {
      expect(nextState.get('gameState'))
        .to.equal(States.WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK);
    });

    // it('does nothing when knockedByPlayer is already set', () => {
    //   expect(1).to.equal(0);
    // });

    // XXX advancePlayer should check `knockedByPlayer` and score/declare game if
    // currentPlayer == knockedByPlayer

    // XXX who even calls advancePlayer??????
  });

  describe('when someone has knocked', () => {
    describe('after last player discards', () => {
      const state = fromJS({
        gameState: States.WAITING_FOR_PLAYER_TO_DISCARD,
        currentPlayer: 'a',
        knockedBy: 'b',
        players: ['a', 'b', 'c'],
        piles: {
          hands: {
            a: ['10s', 'Js', '4s', '5h'],
            b: ['Qc', 'Kc', '10c'],
            c: ['4s', '10h', 'Ac'],
          },
          discard: ['As'],
          draw: ['6s', '7s'],
        },
      });

      const nextState = discardCard(state, 'a', '5h');

      it('sets gameState to KNOCK_HAND_OVER', () => {
        expect(nextState.get('gameState'))
          .to.equal(States.KNOCK_HAND_OVER);
      });

      it('sets winner correctly', () => {
        expect(nextState.get('winner'))
          .to.equal('b');
      });

      it('sets finalScores correctly', () => {
        const expected = fromJS({
          'a': 24,
          'b': 30,
          'c': 11,
        });
        expect(nextState.get('finalScores')).to.equal(expected);
      });
    });
  });
});
