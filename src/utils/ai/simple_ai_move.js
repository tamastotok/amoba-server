const { DIRECTIONS_4 } = require('../directions');

function getRandomMove(board, size) {
  const empty = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === '') empty.push({ row: r, col: c });
    }
  }

  // If the board is full
  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

// WinLogic
function hasFive(board, size, r, c, mark) {
  for (const [dr, dc] of DIRECTIONS_4) {
    let count = 1;

    // Forward
    let rr = r + dr,
      cc = c + dc;
    while (
      rr >= 0 &&
      rr < size &&
      cc >= 0 &&
      cc < size &&
      board[rr][cc] === mark
    ) {
      count++;
      rr += dr;
      cc += dc;
    }

    // Backward
    rr = r - dr;
    cc = c - dc;
    while (
      rr >= 0 &&
      rr < size &&
      cc >= 0 &&
      cc < size &&
      board[rr][cc] === mark
    ) {
      count++;
      rr -= dr;
      cc -= dc;
    }

    if (count >= 5) return true;
  }
  return false;
}

function simpleAIMove(board, size, aiMark, playerMark) {
  // Find win condition
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== '') continue;
      board[r][c] = aiMark;
      if (hasFive(board, size, r, c, aiMark)) {
        board[r][c] = '';
        return { row: r, col: c };
      }
      board[r][c] = '';
    }
  }

  // Find blocking opportunities
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== '') continue;
      board[r][c] = playerMark;
      if (hasFive(board, size, r, c, playerMark)) {
        board[r][c] = '';
        return { row: r, col: c };
      }
      board[r][c] = '';
    }
  }

  // Random move
  return getRandomMove(board, size);
}

module.exports = { getRandomMove, simpleAIMove };
