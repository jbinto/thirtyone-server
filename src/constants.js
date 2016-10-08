import mirrorkey from 'mirrorkey';

export const DEFAULT_DECK = [
  '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', 'Js', 'Qs', 'Ks', 'As',
  '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', '10c', 'Jc', 'Qc', 'Kc', 'Ac',
  '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', 'Jh', 'Qh', 'Kh', 'Ah',
  '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d', 'Jd', 'Qd', 'Kd', 'Ad',
];

export const States = mirrorkey([
  'WAITING_FOR_NEW_PLAYERS_OR_START_GAME',
  'WAITING_FOR_DEAL',
  'WAITING_FOR_PLAYER_TO_DRAW_OR_KNOCK',
  'WAITING_FOR_PLAYER_TO_DISCARD',
  'THIRTY_ONE',
  'KNOCK_HAND_OVER',
  'GAME_ABANDONED',
]);

export const Actions = mirrorkey([
  'ADD_PLAYER',
  'START_GAME',
  'START_NEW_HAND',
  'DRAW_CARD',
  'DRAW_DISCARD',
  'DISCARD_CARD',
  'KNOCK',
  'ABANDON_GAME',
  'RESET_GAME',
]);
