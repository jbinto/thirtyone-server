/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */

import { List, Map, fromJS } from 'immutable';
import * as States from './game_states';
import * as Utils from './utils';
// import * as Constants from './constants';

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

export function drawCard(state, player) {
  const gameState = state.get('gameState');
  if (gameState !== States.WAITING_FOR_PLAYER_TO_DRAW) {
    // console.warn('drawCard() invariant failed: gameState != States.WAITING_FOR_PLAYER_TO_DRAW');
    return state;
  }

  const currentPlayer = state.get('currentPlayer');
  if (player !== currentPlayer) {
    // console.warn('drawCard() invariant failed: player != currentPlayer');
    return state;
  }

  // NOTE: Immutable shift "returns a new List rather than the removed value"
  const draw = state.getIn(['piles', 'draw']);
  const newDraw = draw.shift();

  const hand = state.getIn(['piles', 'hands', player]);
  const newHand = hand.push(draw.first());

  return state
    .set('gameState', States.WAITING_FOR_PLAYER_TO_DISCARD)
    .setIn(['piles', 'draw'], newDraw)
    .setIn(['piles', 'hands', player], newHand);
}


export function discardCard(state, player, cardToDiscard) {
  const hand = state.getIn(['piles', 'hands', player]);
  const discardPile = state.getIn(['piles', 'discard']);

  const newHand = hand.filterNot(card => card === cardToDiscard);
  const newDiscardPile = discardPile.unshift(cardToDiscard);

  const nextState = Utils.advanceCurrentPlayer(state);

  return nextState
    .setIn(['piles', 'discard'], newDiscardPile)
    .setIn(['piles', 'hands', player], newHand);
}
