/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */

import { List, Map, fromJS } from 'immutable';
import { States } from './constants';
import * as Utils from './utils';
import * as Validate from './validate';



/**
 * Returns a new state tree with a new player added.
 * Execute this until the desired number of players is reached, then execute
 * `startGame()`.
 * Will only execute if `gameState` is `WAITING_FOR_NEW_PLAYERS_OR_START_GAME`.
 * @param {Map} state The top-level Thirty-one game state tree.
 * @param {string} playerId The player to be added.
 * @returns {Map} A new, modified game-state tree, with the player added.
 * If the game is already started, returns the original state.
 **/
export function addPlayer(state, playerId) {
  // Can't use ES6 destructuring here because we're not using JS objects
  // HINT: babel-plugin-extensible-destructuring
  const players = state.get('players') || List();
  const gameState = state.get('gameState') || States.WAITING_FOR_NEW_PLAYERS_OR_START_GAME;
  if (gameState !== States.WAITING_FOR_NEW_PLAYERS_OR_START_GAME) {
    return state;
  }

  const newPlayers = players.push(playerId);

  return state
    .set('gameState', gameState)
    .set('players', newPlayers);
}

/**
 * Returns a new state tree with `gameState` set to `WAITING_FOR_DEAL`.
 * Will only execute there is at least 2 players.
 * This "locks in" the current players to the game.
 * Intended to only execute once per game, regardless of how many hands are played.
 * @param {Map} state The top-level Thirty-one game state tree.
 * @returns {Map} A new, modified game-state tree, with `gameState` set to `WAITING_FOR_DEAL`.
 * If there is less than 2 players, returns the original state.
 **/
export function startGame(state) {
  const gameState = state.get('gameState');
  if (gameState !== States.WAITING_FOR_NEW_PLAYERS_OR_START_GAME) {
    return state;
  }

  // bail out if not enough players
  const players = state.get('players');
  if (players.count() < 2) {
    return state;
  }

  return state.set('gameState', States.WAITING_FOR_DEAL);
}

/**
 * Returns a new state tree that represents the begininng of a new hand.
 * Will only execute if `handStarted` is falsy.
 * @param {Map} state The top-level Thirty-one game state tree.
 * @returns {Map} A new state tree with:
 *   `piles` populated with fresh `hands`, `draw`, `discard`;
 *   `handStarted` set to true;
 *   `gameState` set to `WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK`
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
    .set('gameState', States.WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK)
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
    expectedState: States.WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK,
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
    .setIn(['piles', 'hands', player], newHand);

  const isThirtyOne = Utils.scoreHand(newHand) >= 31;
  if (isThirtyOne) {
    return newState
      .set('gameState', States.THIRTY_ONE)
      .set('winner', player)
      .remove('currentPlayer');
  }

  return newState
    .set('gameState', States.WAITING_FOR_PLAYER_TO_DISCARD);
}

/**
 * Returns a new state tree that represents the result of a "draw card" action.
 * Will only execute if the current player is correct, and the game state is
 * WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK.
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
 * WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK.
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
 * Returns whether the hand should end due to a knock. Each player is allowed one
 * turn after a knock. Will only return true when a player has knocked, and that
 * player would be the next player.
 * @param {Map} state The top-level Thirty-one game state tree.
 * @returns {boolean} Whether the hand should end due to a knock.
 */
function _shouldEndHandForKnock(state) {
  const knockedByPlayer = state.get('knockedByPlayer');
  const currentPlayer = state.get('currentPlayer');
  const nextPlayer = Utils.getNextPlayer(
    state.get('players').toArray(),
    currentPlayer
  );
  return knockedByPlayer && knockedByPlayer === nextPlayer;
}

/**
 * Returns a new state tree with the hand ended after a knock. Will only
 * execute if `shouldEndHandForKnock` returns true.
 * @param {Map} state The top-level Thirty-one game state tree.
 * @returns {Map} A new state tree with:
 *   `gameState` set to `KNOCK_HAND_OVER`
 *   `finalScores` set to an object in format { player: score }
 *   `winner` set to the name of the winning player`
 **/
export function _endHandForKnock(state) {
  if (!_shouldEndHandForKnock(state)) {
    return state;
  }

  const hands = state.getIn(['piles', 'hands']);
  const scores = Utils.scoreHands(hands);
  const winner = Utils.winner(hands);

  return state
    .set('gameState', 'KNOCK_HAND_OVER')
    .set('finalScores', scores)
    .set('winner', winner);
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
 *   `gameState` set to `WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK`
 **/
export function discardCard(state, player, cardToDiscard) {
  const valid = Validate.validate({
    state,
    player,
    expectedState: States.WAITING_FOR_PLAYER_TO_DISCARD,
  });
  if (!valid) {
    return state;
  }

  const hand = state.getIn(['piles', 'hands', player]);
  const discardPile = state.getIn(['piles', 'discard']);

  // bail out if player doesn't actually have this card
  if (!hand.includes(cardToDiscard)) {
    return state;
  }

  const newHand = hand.filterNot(card => card === cardToDiscard);
  const newDiscardPile = discardPile.unshift(cardToDiscard);

  let nextState = state
    .setIn(['piles', 'discard'], newDiscardPile)
    .setIn(['piles', 'hands', player], newHand);

  if (_shouldEndHandForKnock(nextState)) {
    return _endHandForKnock(nextState);
  }

  nextState = Utils.advanceCurrentPlayer(nextState);
  return nextState
    .set('gameState', States.WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK)
    .setIn(['piles', 'discard'], newDiscardPile)
    .setIn(['piles', 'hands', player], newHand);
}

/**
 * Returns a new state tree with the current player flagged as having knocked,
 * and the turn advanced to the next player.
 * @param {Map} state The top-level Thirty-one game state tree.
 * @param {string} player The name of the player that is knocking.
 * @returns {Map} A new state tree with:
 *   `knockedByPlayer` decreased by 1 card
 *   `currentPlayer` advanced to the next player
 *   `gameState` remaining at WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK
 **/
export function knock(state, player) {
  const valid = Validate.validate({
    state,
    player,
    expectedState: States.WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK,
  });
  if (!valid || state.get('knockedByPlayer')) {
    return state;
  }

  const nextState = Utils.advanceCurrentPlayer(state);
  return nextState
    .set('knockedByPlayer', player);
}
