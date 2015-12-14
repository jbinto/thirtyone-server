/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */

import { List, Map, fromJS } from 'immutable';
import shuffleArray from 'shuffle-array';
import * as states from './game_states';
// import _ from 'lodash';

export const INITIAL_STATE = Map();

const DEFAULT_DECK = [
  '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', 'Js', 'Qs', 'Ks', 'As',
  '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', '10c', 'Jc', 'Qc', 'Kc', 'Ac',
  '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', 'Jh', 'Qh', 'Kh', 'Ah',
  '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d', 'Jd', 'Qd', 'Kd', 'Ad',
];

export function shuffle(deck) {
  return shuffleArray(deck, { copy: true });
}

const getShuffledDeck = () => {
  return shuffle(DEFAULT_DECK);
};

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
  const deck = getShuffledDeck(); // XXX should probably return an immutable list
  let hands = Map();

  players.forEach((player) => {
    const threeCards = deck.splice(0, 3); // mutates `deck`
    hands = hands.set(player, List(threeCards));
  });

  const discard = deck.shift();

  const piles = fromJS({
    hands: hands,
    discard: [discard],
    draw: deck,
  });

  const nextState = state
    .set('gameState', states.WAITING_FOR_PLAYER_TO_DRAW)
    .set('handStarted', true)
    .set('currentPlayer', players.first())
    .set('piles', piles);

  return nextState;
}

export function drawCard(state, player) {
  const gameState = state.get('gameState');
  if (gameState !== states.WAITING_FOR_PLAYER_TO_DRAW) {
    // console.warn('drawCard() invariant failed: gameState != states.WAITING_FOR_PLAYER_TO_DRAW');
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
    .set('gameState', states.WAITING_FOR_PLAYER_TO_DISCARD)
    .setIn(['piles', 'draw'], newDraw)
    .setIn(['piles', 'hands', player], newHand);
}


export function discardCard(state, player, cardToDiscard) {
  const hand = state.getIn(['piles', 'hands', player]);
  const discardPile = state.getIn(['piles', 'discard']);

  const newHand = hand.filterNot(card => card === cardToDiscard);
  const newDiscardPile = discardPile.unshift(cardToDiscard);

  return state
    .setIn(['piles', 'discard'], newDiscardPile)
    .setIn(['piles', 'hands', player], newHand);
}
