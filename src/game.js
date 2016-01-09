/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */

import { List, Map, fromJS } from 'immutable';
import * as States from './game_states';
import * as Utils from './utils';
import * as Validate from './validate';

/**
 * Returns a new state tree with a new player added. Will only execute if
 * `gameStarted` is falsy.
 * @param {Map} state The top-level Thirty-one game state tree.
 * @param {string} playerId The player to be added.
 * @returns {Map} A new, modified game-state tree, with the player added.
 * If the game is already started, returns the original state.
 **/
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

/**
 * Returns a new state tree with `gameStarted` set to true.
 * Will only execute there is at least 2 players.
 * @param {Map} state The top-level Thirty-one game state tree.
 * @returns {Map} A new, modified game-state tree, with `gameState` set to true.
 * If there is less than 2 players, returns the original state.
 **/
export function startGame(state) {
  const players = state.get('players');
  if (players.count() > 1) {
    // XXX what if gameStarted=true already? This is just a noop
    return state.set('gameStarted', true);
  }

  return state;
}

/**
 * Returns a new state tree that represents the begininng of a new hand.
 * Will only execute if `handStarted` is falsy.
 * @param {Map} state The top-level Thirty-one game state tree.
 * @returns {Map} A new state tree with:
 *   `piles` populated with fresh `hands`, `draw`, `discard`;
 *   `handStarted` set to true;
 *   `gameState` set to `WAITING_FOR_PLAYER_TO_DRAW`
 **/
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
    hands,
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

/**
 * Returns a new state tree that represents the result of a "draw" or "discard" action.
 * @param {Map} state The top-level Thirty-one game state tree.
 * @param {string} player The name of the player that is drawing.
 * @param {string} whichPile The name of the pile to draw from. Must be either
 * 'draw' or 'discard'.
 * @returns {Map} A new state tree with:
 *   `piles.hands.{player}` increased by 1 card
 *   `piles.{whichPile}` decreased by 1 card
 **/
function _draw(state, player, whichPile) {
  const valid = Validate.validate({
    state,
    player,
    expectedState: States.WAITING_FOR_PLAYER_TO_DRAW,
  });
  if (!valid) {
    return state;
  }

  // NOTE: Immutable shift "returns a new List rather than the removed value"
  const pile = state.getIn(['piles', whichPile]);
  const newPile = pile.shift();

  const hand = state.getIn(['piles', 'hands', player]);
  const newHand = hand.push(pile.first());

  const newState = state
    .setIn(['piles', whichPile], newPile)
    .setIn(['piles', 'hands', player], newHand)
    .set('gameState', States.WAITING_FOR_PLAYER_TO_DISCARD);

  const newScore = Utils.scoreHand(newHand);
  if (newScore >= 31) {
    return newState
      .set('gameState', States.THIRTY_ONE)
      .set('winner', player)
      .remove('currentPlayer');
  }

  return newState;
}

/**
 * Returns a new state tree that represents the result of a "draw card" action.
 * Will only execute if the current player is correct, and the game state is
 * WAITING_FOR_PLAYER_TO_DRAW.
 * @param {Map} state The top-level Thirty-one game state tree.
 * @param {string} player The name of the player that is drawing.
 * @returns {Map} A new state tree with:
 *   `piles.hands.{player}` increased by 1 card
 *   `piles.draw` decreased by 1 card
 *   `gameState` set to `WAITING_FOR_PLAYER_TO_DISCARD`
 **/
export function drawCard(state, player) {
  return _draw(state, player, 'draw');
}

/**
 * Returns a new state tree that represents the result of a "draw from discard" action.
 * Will only execute if the current player is correct, and the game state is
 * WAITING_FOR_PLAYER_TO_DRAW.
 * @param {Map} state The top-level Thirty-one game state tree.
 * @param {string} player The name of the player that is drawing.
 * @returns {Map} A new state tree with:
 *   `piles.hands.{player}` increased by 1 card
 *   `piles.discard` decreased by 1 card
 *   `gameState` set to `WAITING_FOR_PLAYER_TO_DISCARD`
 **/
export function drawDiscard(state, player) {
  // EDGE CASE: do nothing if discard pile is empty
  // XXX BUG FIXME: it's actually impossible for discard pile to get empty.
  // Everyone must discard, so there will always be at least 1 card.
  // XXX leave this code here for now, because the draw pile CAN get empty,
  // and would need a reshuffle.
  const discard = state.getIn(['piles', 'discard']);
  if (discard && discard.count() === 0) {
    return state;
  }

  return _draw(state, player, 'discard');
}

/**
 * Returns a new state tree that represents the result of a "discard card" action.
 * Will only execute if the current player is correct, and the game state is
 * WAITING_FOR_PLAYER_TO_DISCARD.
 * @param {Map} state The top-level Thirty-one game state tree.
 * @param {string} player The name of the player that is discarding.
 * @param {Map} cardToDiscard The card to be discarded.
 * @returns {Map} A new state tree with:
 *   `piles.hands.{player}` decreased by 1 card
 *   `piles.discard` increased by 1 card
 *   `gameState` set to `WAITING_FOR_PLAYER_TO_DRAW`
 **/
export function discardCard(state, player, cardToDiscard) {
  // XXX negative test: discard card you don't have => state
  const valid = Validate.validate({
    state,
    player,
    expectedState: States.WAITING_FOR_PLAYER_TO_DISCARD,
  });
  if (!valid) {
    return state;
  }
  const hand = state.getIn(['piles', 'hands', player]);

  // bail out if player doesn't actually have this card
  const hasCardInHand = hand.includes(cardToDiscard);
  if (!hasCardInHand) {
    return state;
  }

  const discardPile = state.getIn(['piles', 'discard']);

  const newHand = hand.filterNot(card => card === cardToDiscard);
  const newDiscardPile = discardPile.unshift(cardToDiscard);

  const nextState = Utils.advanceCurrentPlayer(state);

  // XXX TODO score for 31 here

  return nextState
    .set('gameState', States.WAITING_FOR_PLAYER_TO_DRAW)
    .setIn(['piles', 'discard'], newDiscardPile)
    .setIn(['piles', 'hands', player], newHand);
}
