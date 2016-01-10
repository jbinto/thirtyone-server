/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */
/* (above: Make ESLint happy about Map() not being a real constructor) */

import { Map } from 'immutable';
import {
  addPlayer,
  startGame,
  startNewHand,
  drawCard,
} from './game';
import * as States from '../src/game_states';

const INITIAL_STATE = Map({
  gameState: States.WAITING_FOR_NEW_PLAYERS_OR_START_GAME,
});

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'ADD_PLAYER':
      return addPlayer(state, action.player);
    case 'START_GAME':
      return startGame(state);
    case 'START_NEW_HAND':
      return startNewHand(state);
    case 'DRAW_CARD':
      return drawCard(state, action.player);
    default:
      return state;
  }
}
