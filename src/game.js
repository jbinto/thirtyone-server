/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */

import { List, Map, fromJS } from 'immutable';
import * as States from './game_states';
import * as Utils from './utils';
// import * as Constants from './constants';
import * as Validate from './validate';

export function addPlayer(state, playerId) {
  // Can't use ES6 destructuring here because we're not using JS objects
  // HINT: babel-plugin-extensible-destructuring
  const players = state.get('players') || List();
  const gameStarted = state.get('gameStarted') || false;

  if (gameStarted) {
    return state;
  }

  const newPlayers = players.push(playerId);

  return fromJS({
    players: newPlayers,
    gameStarted,
  });
}

export function startGame(state) {
  const players = state.get('players');
  if (players.count() > 1) {
    return state.set('gameStarted', true);
  }

  return state;
}

export function startNewHand(state) {
  if (state.get('handStarted')) {
    return state;
  }

  const players = state.get('players');
  let deck = Utils.getShuffledDeck();
  let hands = Map();

  // deal 3 cards to each player
  players.forEach((player) => {
    const hand = deck.take(3);
    deck = deck.skip(3);
    hands = hands.set(player, hand);
  });

  // show 1 discard
  const discard = deck.first();
  deck = deck.skip(1);

  const piles = fromJS({
    hands: hands,
    discard: [discard],
    draw: deck,
  });

  const nextState = state
    .set('gameState', States.WAITING_FOR_PLAYER_TO_DRAW)
    .set('handStarted', true)
    .set('currentPlayer', players.first())
    .set('piles', piles);

  return nextState;
}

// Refactored common code from drawCard and drawDiscard
// Valid args for `whichPile`: `draw`, `discard`
function draw(state, player, whichPile) {
  const valid = Validate.validate({
    state,
    player,
    expectedState: 'WAITING_FOR_PLAYER_TO_DRAW',
  });
  if (!valid) {
    return state;
  }

  // NOTE: Immutable shift "returns a new List rather than the removed value"
  const pile = state.getIn(['piles', whichPile]);
  const newPile = pile.shift();

  const hand = state.getIn(['piles', 'hands', player]);
  const newHand = hand.push(pile.first());

  return state
    .set('gameState', States.WAITING_FOR_PLAYER_TO_DISCARD)
    .setIn(['piles', whichPile], newPile)
    .setIn(['piles', 'hands', player], newHand);
}

export function drawCard(state, player) {
  return draw(state, player, 'draw');
}

export function drawDiscard(state, player) {
  // EDGE CASE: do nothing if discard pile is empty
  const discard = state.getIn(['piles', 'discard']);
  if (discard && discard.count() === 0) {
    return state;
  }

  return draw(state, player, 'discard');
}

export function discardCard(state, player, cardToDiscard) {
  const valid = Validate.validate({
    state,
    player,
    expectedState: 'WAITING_FOR_PLAYER_TO_DISCARD',
  });
  if (!valid) {
    return state;
  }

  const hand = state.getIn(['piles', 'hands', player]);
  const discardPile = state.getIn(['piles', 'discard']);

  const newHand = hand.filterNot(card => card === cardToDiscard);
  const newDiscardPile = discardPile.unshift(cardToDiscard);

  const nextState = Utils.advanceCurrentPlayer(state);

  return nextState
    .set('gameState', States.WAITING_FOR_PLAYER_TO_DRAW)
    .setIn(['piles', 'discard'], newDiscardPile)
    .setIn(['piles', 'hands', player], newHand);
}
