const { POPULATION_SIZE } = require('../ai_state');
const { DIRECTIONS_4 } = require('../directions');

class Strategy {
  constructor(id, weights = null) {
    this.id = id;

    // Add weights to ai behavior
    this.weights = weights || {
      // Basic weights
      center: Math.random(),
      randomness: 0.05,

      // Attack weights
      myLine2: Math.random(),
      myLine3: Math.random(),
      myLine4: Math.random(),

      // Defense weights
      blockLine2: Math.random(),
      blockLine3: Math.random(),
      blockLine4: Math.random(),
    };
    this.fitness = 0; // improve by learning
  }

  // Normalize weights
  normalize() {
    const sum = Object.values(this.weights).reduce((a, b) => a + b, 0);
    if (sum === 0) return;
    for (let key in this.weights) {
      this.weights[key] /= sum;
    }
  }
}

// Create population
function createInitialPopulation(size = POPULATION_SIZE) {
  const population = [];
  for (let i = 0; i < size; i++) {
    const s = new Strategy(i + 1);
    s.normalize();
    population.push(s);
  }
  return population;
}

// Simple decision making by weights
function evaluateMove(board, row, col, strategy, aiMark, humanMark) {
  // Basic heuristic value
  let score = 0;
  const size = board.length;

  // Preference playing on the center area of the board
  const center = Math.floor(board.length / 2);
  const distFromCenter = Math.abs(row - center) + Math.abs(col - center);
  score += strategy.weights.center * (1.0 / (distFromCenter + 1));

  // Patterns
  // Attack
  const attackPotential = getMaxLineLength(board, row, col, aiMark, size);

  if (attackPotential >= 5) score += 1000;
  else if (attackPotential === 4) score += strategy.weights.myLine4 * 10;
  else if (attackPotential === 3) score += strategy.weights.myLine3 * 5;
  else if (attackPotential === 2) score += strategy.weights.myLine2;

  // Defense
  const defensePotential = getMaxLineLength(board, row, col, humanMark, size);

  if (defensePotential >= 5) score += 500;
  else if (defensePotential === 4) score += strategy.weights.blockLine4 * 10;
  else if (defensePotential === 3) score += strategy.weights.blockLine3 * 5;
  else if (defensePotential === 2) score += strategy.weights.blockLine2;

  // Random
  score += strategy.weights.randomness * Math.random();

  return score;
}

function getMaxLineLength(board, r, c, mark, size) {
  let maxLength = 1;

  for (const [dr, dc] of DIRECTIONS_4) {
    let currentLength = 1;

    // Forward
    let i = 1;
    while (true) {
      const nr = r + dr * i;
      const nc = c + dc * i;
      if (
        nr < 0 ||
        nr >= size ||
        nc < 0 ||
        nc >= size ||
        board[nr][nc] !== mark
      )
        break;
      currentLength++;
      i++;
    }

    // Backward
    i = 1;
    while (true) {
      const nr = r - dr * i;
      const nc = c - dc * i;
      if (
        nr < 0 ||
        nr >= size ||
        nc < 0 ||
        nc >= size ||
        board[nr][nc] !== mark
      )
        break;
      currentLength++;
      i++;
    }

    if (currentLength > maxLength) {
      maxLength = currentLength;
    }
  }
  return maxLength;
}

function geneticAIMove(board, boardSize, aiMark, humanMark, strategy) {
  let bestMove = null;
  let bestScore = -Infinity;

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (board[row][col] === '') {
        const score = evaluateMove(
          board,
          row,
          col,
          strategy,
          aiMark,
          humanMark
        );

        if (score > bestScore) {
          bestScore = score;
          bestMove = { row, col, value: aiMark };
        }
      }
    }
  }

  return bestMove;
}

module.exports = {
  Strategy,
  createInitialPopulation,
  geneticAIMove,
};
