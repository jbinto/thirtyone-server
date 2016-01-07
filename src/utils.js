/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */
import shuffleArray from 'shuffle-array';
import { List, fromJS } from 'immutable';
import _ from 'underscore';
import * as Constants from './constants';
import 'babel-polyfill'; // XXX HACK FIXME for Array.prototype.includes :(

/**
 * Returns the name of the next player.
 * @param {string[]} players The list of players.
 * @param {string} currentPlayer The current player.
 * @returns {string} The next player in sequence, looping back to the first player.
 * @example getNextPlayer(['a', 'b'], 'a');      // => 'b'
 * @example getNextPlayer(['a', 'b', 'c'], 'c'); // => 'a'
 */
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

/**
 * Advances the game state to the next player in sequence.
 * @param {Map} state The top-level Thirty-One game state tree.
 * @returns {Map} A modified Thirty-One game state tree.
 **/
export function advanceCurrentPlayer(state) {
  // XXX no test written here
  // XXX this doesn't really belong here, anything that touches
  // `state` should be in one place IMHO
  // XXX really this is just a wrapper around `getNextPlayer`

  const players = state.get('players');
  const currentPlayer = state.get('currentPlayer');
  const nextPlayer = getNextPlayer(players.toArray(), currentPlayer);

  return state.set('currentPlayer', nextPlayer);
}

/**
 * Given an array of cards, returns a new shuffled array of cards.
 * @param {string[]} deck An array of cards (formatted e.g. 'Kc' or '3d')
 * @returns {string[]} A new, shuffled array of cards.
 **/
export function shuffle(deck) {
  return shuffleArray(deck, { copy: true });
}

/**
 * Generates a new, shuffled deck.
 * @returns {string[]} A new, shuffled deck of cards.
 **/
export function getShuffledDeck() {
  const shuffled = shuffle(Constants.DEFAULT_DECK);
  return List(shuffled);
}

/**
 * Returns the ordinal rank of the card.
 * @param {string} cardName The name of the card, e.g. '4' or 'K'.
 * @returns {number} The ordinal rank of the card, e.g. aces are worth 11.
 */
function _getRank(cardName) {
  const faceCardRanks = {
    'J': 10,
    'K': 10,
    'Q': 10,
    'A': 11,
  };
  const rank = faceCardRanks[cardName];
  if (rank === undefined) {
    return parseInt(cardName, 10);
  }

  return rank;
}

/**
 * Attempts to parse the given string into a card Map.
 * @param {string} fullCardString The string representing the card, e.g. '10d' or 'Kc'
 * @returns {Map} The parsed card, with keys 'name', 'rank' and 'suit'. Returns `undefined` if the card could not be parsed.
 */
export function parseCard(fullCardString) {
  const regex = /([2-9]|10|J|K|Q|A)([cdhs])/;
  const matches = fullCardString.match(regex);
  if (!matches) {
    return undefined;
  }
  const [name, suit] = matches.slice(1); // slice: matches[0] is original string
  const rank = _getRank(name);
  return fromJS({ rank, name, suit });
}

/**
 * Returns the numeric score of the hand according to the rules of Thirty-One.
 * @param {List<Map>} hand The Thirty-One hand to be scored.
 * @returns {number} The computed score of the hand.
 */
export function scoreHand(hand) {
  const cards = hand.map(parseCard);
  const ranksBySuit = { c: 0, d: 0, h: 0, s: 0 };
  cards.forEach((card) => {
    ranksBySuit[card.get('suit')] += card.get('rank');
  });

  return _.max(Object.values(ranksBySuit));
}
