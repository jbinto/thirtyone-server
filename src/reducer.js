/* eslint new-cap: [2, {capIsNewExceptions: ["Map", "List"]}] */
/* (above: Make ESLint happy about Map() not being a real constructor) */

import { Map } from 'immutable';
import {
  addPlayer,
  startGame,
  startNewHand,
  drawCard,
  drawDiscard,
  discardCard,
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
    case 'DRAW_DISCARD':
      return drawDiscard(state, action.player);
    case 'DISCARD_CARD':
      console.log('oijdsafiosjf08eur23089ru230fr3');
      return discardCard(state, action.player, action.card);
    default:
      return state;
  }
}
