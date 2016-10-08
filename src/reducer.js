/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */
/* (above: Make ESLint happy about Map() not being a real constructor) */

import { Map } from 'immutable';
import * as Game from './game';
import { States, Actions } from '../src/constants';

const INITIAL_STATE = Map({
  gameState: States.WAITING_FOR_NEW_PLAYERS_OR_START_GAME,
});

export default function reducer(state = INITIAL_STATE, action) {
  console.log(`reducer action=${JSON.stringify(action)} state=${JSON.stringify(state)}`)
  switch (action.type) {
    case Actions.ADD_PLAYER:
      return Game.addPlayer(state, action.player);
    case Actions.START_GAME:
      return Game.startGame(state);
    case Actions.START_NEW_HAND:
      return Game.startNewHand(state);
    case Actions.DRAW_CARD:
      return Game.drawCard(state, action.player);
    case Actions.DRAW_DISCARD:
      return Game.drawDiscard(state, action.player);
    case Actions.DISCARD_CARD:
      return Game.discardCard(state, action.player, action.card);
    case Actions.KNOCK:
      return Game.knock(state, action.player);
    default:
      return state;
  }
}
