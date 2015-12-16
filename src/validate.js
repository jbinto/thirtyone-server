
function warn(msg) {
  return;
  console.warn(msg);
  console.trace();
}

export function isCorrectPlayer(state, player) {
  const currentPlayer = state.get('currentPlayer');
  if (player !== currentPlayer) {
    warn(`isCorrectPlayer failed: player ${player} !== currentPlayer ${currentPlayer}`);
    return false;
  }

  return true;
}

export function isCorrectState(state, expectedState) {
  const gameState = state.get('gameState');
  if (gameState !== expectedState) {
    warn(`validateIsCorrectState failed: expected ${expectedState} !== actual ${gameState}`);
    return false;
  }

  return true;
}

export function validate({ state, player, expectedState }) {
  return isCorrectPlayer(state, player)
    && isCorrectState(state, expectedState);
}
