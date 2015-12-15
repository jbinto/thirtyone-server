/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */
import shuffleArray from 'shuffle-array';
import { List } from 'immutable';
import * as Constants from './constants';

// Examples:
//  getNextPlayer(['a', 'b'],      'a') => 'b'
//  getNextPlayer(['a', 'b', 'c'], 'c') => 'a'
export function getNextPlayer(players, currentPlayer) {
  const playerIndex = players.indexOf(currentPlayer);
  const playerOrdinal = playerIndex + 1;

  // return null for bogus currentPlayer
  if (playerIndex < 0) {
    return null; // XXX should really throw here
  }

  // loop around the array if at end
  const atEnd = (playerOrdinal === players.length);
  if (atEnd) {
    return players[0];
  }

  // just return the next player
  return players[playerOrdinal];
}

// XXX no test written here
export function advanceCurrentPlayer(state) {
  const players = state.get('players');
  const currentPlayer = state.get('currentPlayer');
  const nextPlayer = getNextPlayer(players.toArray(), currentPlayer);

  return state.set('currentPlayer', nextPlayer);
}

export function shuffle(deck) {
  return shuffleArray(deck, { copy: true });
}

export function getShuffledDeck() {
  const shuffled = shuffle(Constants.DEFAULT_DECK);
  return List(shuffled);
}
