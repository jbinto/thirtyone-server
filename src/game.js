/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */

import { List, Map, fromJS } from 'immutable';

export const INITIAL_STATE = Map();

const deck = [
  '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', 'Js', 'Qs', 'Ks', 'As',
  '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', '10c', 'Jc', 'Qc', 'Kc', 'Ac',
  '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', 'Jh', 'Qh', 'Kh', 'Ah',
  '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d', 'Jd', 'Qd', 'Kd', 'Ad'
]

export function addPlayer(state, playerId) {
  console.log(`addPlayer: state=${JSON.stringify(state)}, playerID=${playerId}`);

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

export function startNewHand(state) {
  let nextState = state;

  const firstPlayer = state.get('players').first();

  nextState = nextState.set('handInPlay', true);
  nextState = nextState.set('currentPlayer', firstPlayer);

  return nextState;
}
