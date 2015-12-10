/* eslint new-cap: [2, {capIsNewExceptions: ["Map"]}] */
/* (above: Make ESLint happy about Map() not being a real constructor) */

/* globals describe, it */

import { expect } from 'chai';
import { addPlayer, startGame, startNewHand, shuffle } from '../src/game';
import { Map, List, fromJS } from 'immutable';
import _ from 'lodash';

// n.b. BUG XXX HACK -- don't store computable data like playerCount

describe('pre-game', () => {
  it('handles adding the first and second player', () => {
    const player1 = 'abcd1234';
    const player2 = 'efgh5678';

    let nextState = addPlayer(Map(), player1);
    expect(nextState).to.equal(fromJS({
      playerCount: 1,
      players: ['abcd1234'],
      gameStarted: false,
    }));

    nextState = addPlayer(nextState, player2);
    expect(nextState).to.equal(fromJS({
      playerCount: 2,
      players: ['abcd1234', 'efgh5678'],
      gameStarted: false,
    }));
  });

  it('ignores adding players when game is started', () => {
    const state = fromJS({
      playerCount: 2,
      players: ['a', 'b'],
      gameStarted: true,
    });

    const nextState = addPlayer(state, 'c');

    expect(nextState).to.equal(state);
  });

  it('will not start game if only 1 player', () => {
    const state = fromJS({
      playerCount: 1,
      players: ['a'],
      gameStarted: false,
    });

    const nextState = startGame(state);
    expect(nextState).to.equal(state);
  });

  it('will start game if 2 players', () => {
    const state = fromJS({
      playerCount: 2,
      players: ['a', 'b'],
      gameStarted: false,
    });

    const nextState = startGame(state);
    expect(nextState.get('gameStarted')).to.be.true();
  });

});


describe('one hand', () => {
  it('can deal a 2 player game', () => {
    const state = fromJS({
      playerCount: 2,
      players: ['a', 'b'],
      gameStarted: true,
    })

    const nextState = startNewHand(state);


    //console.log(`nextState: ${JSON.stringify(nextState)}`);

    expect(nextState.get('handInPlay')).to.be.true();
    expect(nextState.get('currentPlayer')).to.equal(
      nextState.get('players').first()
    );

    const piles = nextState.get('piles');


    expect(piles.count()).to.equal(3);
    expect(piles.get('hands').count()).to.equal(2);


    console.log(`piles: ${piles.get('hands')}`);
    expect(piles.get('discard').count()).to.equal(1);
    expect(piles.get('hands').first().count()).to.equal(3);
    expect(piles.get('hands').last().count()).to.equal(3);
    expect(piles.get('draw').count()).to.equal(52 - 3 - 3 - 1); // 45
  });
});

describe('shuffle', () => {
  let original, copy;

  beforeEach(() => {
    original = _.range(0,100);
  });

  it('shuffle doesnt mutate the array', () => {
    const copy = _.clone(original);
    shuffle(original); // no-op
    expect(original).to.deep.equal(copy);
  });

  it('shuffle does return a new order', () => {
    const shuffled = shuffle(original);
    expect(shuffled).not.to.deep.equal(original);
  });


})
