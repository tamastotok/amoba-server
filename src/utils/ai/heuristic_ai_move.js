const { DIRECTIONS_4 } = require('../directions');

/**
 * Heuristic AI decisionmaking
 * - trying to win
 * - trying to block
 * - chooses near or middle field if neither them are possible
 */

function heuristicAIMove(board, size, aiMark, humanMark) {
  // Helper function: check if the field is within the board
  const isInside = (r, c) => r >= 0 && r < size && c >= 0 && c < size;

  // Check if the AI can win in the next move
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] !== '') continue;

      board[row][col] = aiMark;
      if (isWinningMove(board, row, col, aiMark, DIRECTIONS_4, size)) {
        board[row][col] = '';
        return { row, col, value: aiMark }; // winning move
      }
      board[row][col] = '';
    }
  }

  // Blocking: if the player is 1 move away from winning
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] !== '') continue;

      board[row][col] = humanMark;
      if (isWinningMove(board, row, col, humanMark, DIRECTIONS_4, size)) {
        board[row][col] = '';
        return { row, col, value: aiMark }; // blocking
      }
      board[row][col] = '';
    }
  }

  // Heuristic scoring: choose from the best fields
  const scores = [];
  const center = Math.floor(size / 2);

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] !== '') continue;

      // Base point based on distance from center
      const distance = Math.abs(center - row) + Math.abs(center - col);
      let score = 10 - distance;

      // + point if it's own marks are near
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (!isInside(row + dr, col + dc)) continue;
          if (board[row + dr][col + dc] === aiMark) score += 3;
          if (board[row + dr][col + dc] === humanMark) score += 1;
        }
      }

      scores.push({ row, col, score });
    }
  }

  if (scores.length === 0) return null;

  // Choose the field with the highest score
  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  return { row: best.row, col: best.col, value: aiMark };
}

// Check if 1 move results a win
function isWinningMove(board, row, col, mark, directions, size) {
  for (const [dx, dy] of directions) {
    let count = 1;

    // Forward
    for (let step = 1; step < 5; step++) {
      const r = row + dx * step;
      const c = col + dy * step;
      if (!isInside(r, c, size) || board[r][c] !== mark) break;
      count++;
    }

    // Backward
    for (let step = 1; step < 5; step++) {
      const r = row - dx * step;
      const c = col - dy * step;
      if (!isInside(r, c, size) || board[r][c] !== mark) break;
      count++;
    }

    if (count >= 5) return true;
  }

  return false;
}

function isInside(r, c, size) {
  return r >= 0 && r < size && c >= 0 && c < size;
}

module.exports = { heuristicAIMove };
