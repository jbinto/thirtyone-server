function warn(msg) {
  // XXX `warn` commented because it pollutes (negative) tests with noise
  // XXX should use real logging levels here
  // XXX everything here is really an invariant and should blow up
  // console.warn(msg);
  return msg;
}

/**
 * Returns whether the current player matches the passed-in player.
 * @param {Map} state The top-level Thirty-One game state tree.
 * @param {string} player The name of the player (presumably, the one that just sent an action.)
 * @returns {bool} Whether or not the current player matched the expected player.
 **/
export function isCorrectPlayer(state, player) {
  const currentPlayer = state.get('currentPlayer');
  if (player !== currentPlayer) {
    warn(`isCorrectPlayer failed: player ${player} !== currentPlayer ${currentPlayer}`);
    return false;
  }

  return true;
}

/**
 * Returns whether the current game state matches the passed-in expected state.
 * @param {Map} state The top-level Thirty-One game state tree.
 * @param {string} expectedState The state to compare against, e.g. WAITING_FOR_PLAYER_TO_DRAW
 * @returns {bool} Whether or not the current game state matched the expected game state.
 **/
export function isCorrectState(state, expectedState) {
  const gameState = state.get('gameState');
  if (gameState !== expectedState) {
    warn(`validateIsCorrectState failed: expected ${expectedState} !== actual ${gameState}`);
    return false;
  }

  return true;
}

/**
 * Performs sanity checks on the current state, by checking whether
 * the game should be processing events for a specific player, and for specific
 * game states.
 * @param {Map} state The top-level Thirty-One game state tree.
 * @param {string} player The name of the player (presumably, the one that just sent an action.)
 * @param {string} expectedState The state to compare against, e.g. WAITING_FOR_PLAYER_TO_DRAW
 * @returns {bool} Whether or not the parameters passed the sanity check, given the current state.
 **/
export function validate({ state, player, expectedState }) {
  return isCorrectPlayer(state, player)
    && isCorrectState(state, expectedState);
}
