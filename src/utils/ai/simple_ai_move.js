const { DIRECTIONS_4 } = require('../directions');

// Random move
function getRandomMove(board, size) {
  const empty = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === '') empty.push({ row: r, col: c });
    }
  }
  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

// WinLogic
function hasFive(board, row, col, mark) {
  const size = board.length;

  const countMatches = (dr, dc) => {
    let count = 0;
    let r = row + dr;
    let c = col + dc;

    while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === mark) {
      count++;
      r += dr;
      c += dc;
    }

    return count;
  };

  for (const [dr, dc] of DIRECTIONS_4) {
    let count = 1;
    count += countMatches(dr, dc);
    count += countMatches(-dr, -dc);
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
