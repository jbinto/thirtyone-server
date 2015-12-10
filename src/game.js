/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */

import { List, Map, fromJS } from 'immutable';
import shuffleArray from 'shuffle-array';

export const INITIAL_STATE = Map();

const getDefaultDeck = () => [
  '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', 'Js', 'Qs', 'Ks', 'As',
  '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', '10c', 'Jc', 'Qc', 'Kc', 'Ac',
  '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', 'Jh', 'Qh', 'Kh', 'Ah',
  '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d', 'Jd', 'Qd', 'Kd', 'Ad',
];

export function shuffle(deck) {
  return shuffleArray(deck, { copy: true });
}

export function addPlayer(state, playerId) {
  // Can't use ES6 destructuring here because we're not using JS objects
  const playerCount = state.get('playerCount') || 0;
  const players = state.get('players') || List();
  const gameStarted = state.get('gameStarted') || false;

  if (gameStarted) {
    return state;
  }

  const newPlayerCount = playerCount + 1;
  const newPlayers = players.push(playerId);

  return fromJS({
    players: newPlayers,
    playerCount: newPlayerCount,
    gameStarted,
  });
}

export function startGame(state) {
  const playerCount = state.get('players').count();
  if (playerCount > 1) {
    return state.set('gameStarted', true);
  }

  return state;
}

function deal(state) {
  // XXX what is the state scope here?? Should be thinking about subtrees..
  // XXX BUG: Don't deal if gameStarted already

  const deck = getDefaultDeck();
  const { playerCount } = state.toJS();

  const hands = [];
  for (let i = 0; i < playerCount; i++) {
    const three = [deck.shift(), deck.shift(), deck.shift()];
    hands.push(three);
  }

  const discard = deck.shift();

  const piles = fromJS({
    hands: hands,
    discard: [discard],
    draw: deck,
  });

  const nextState = state.set('piles', piles); // XXX immutable?
  return nextState;
}

export function startNewHand(state) {
  const players = state.get('players');
  let nextState = state
    .set('handInPlay', true)
    .set('currentPlayer', players.first());

  nextState = deal(nextState);
  return nextState;
}
