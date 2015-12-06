/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */

import { List, Map, fromJS } from 'immutable';

export const INITIAL_STATE = Map();

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
