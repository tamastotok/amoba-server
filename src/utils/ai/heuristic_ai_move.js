/**
 * Heurisztikus AI döntéshozatal
 * - próbál nyerni
 * - próbál blokkolni
 * - ha egyik sem, akkor közeli vagy középső mezőt választ
 */
function heuristicAIMove(board, size, aiMark, humanMark) {
  const directions = [
    [1, 0], // vízszintes
    [0, 1], // függőleges
    [1, 1], // átló (bal felső → jobb alsó)
    [1, -1], // átló (jobb felső → bal alsó)
  ];

  // Segédfüggvény: adott mező a táblán belül van-e
  const isInside = (r, c) => r >= 0 && r < size && c >= 0 && c < size;

  // Ellenőrizzük, tud-e az AI nyerni a következő lépésben
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] !== '') continue;

      board[row][col] = aiMark;
      if (isWinningMove(board, row, col, aiMark, directions, size)) {
        board[row][col] = '';
        return { row, col, value: aiMark }; // nyerő lépés
      }
      board[row][col] = '';
    }
  }

  // Blokkolás: ha az ember 1 lépésre van a győzelemtől, állítsuk meg
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] !== '') continue;

      board[row][col] = humanMark;
      if (isWinningMove(board, row, col, humanMark, directions, size)) {
        board[row][col] = '';
        return { row, col, value: aiMark }; // blokkoljuk
      }
      board[row][col] = '';
    }
  }

  // Heurisztikus pontozás: válassz a legjobb mezők közül
  const scores = [];
  const center = Math.floor(size / 2);

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] !== '') continue;

      // alap pont a középponttól való távolság alapján
      const distance = Math.abs(center - row) + Math.abs(center - col);
      let score = 10 - distance;

      // +pont, ha saját jelek közelében van
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

  // A legjobb pontszámú mezőt választjuk
  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  return { row: best.row, col: best.col, value: aiMark };
}

/**
 * Ellenőrzi, hogy egy lépés nyerést eredményez-e
 */
function isWinningMove(board, row, col, mark, directions, size) {
  for (const [dx, dy] of directions) {
    let count = 1;

    // előre
    for (let step = 1; step < 5; step++) {
      const r = row + dx * step;
      const c = col + dy * step;
      if (!isInside(r, c, size) || board[r][c] !== mark) break;
      count++;
    }

    // vissza
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
