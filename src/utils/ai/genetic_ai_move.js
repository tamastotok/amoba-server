const { DIRECTIONS_8 } = require('../directions');

class Strategy {
  constructor(id, weights = null) {
    this.id = id;

    // Add weights to ai behavior
    this.weights = weights || {
      attack: Math.random(), // attack
      defense: Math.random(), // defense
      center: Math.random(), // move to center
      randomness: Math.random(), // add randomness
    };
    this.fitness = 0; // improve by learning
  }

  // Normalize weights
  normalize() {
    const sum = Object.values(this.weights).reduce((a, b) => a + b, 0);
    for (let key in this.weights) {
      this.weights[key] /= sum;
    }
  }
}

// Create population
function createInitialPopulation(size = 10) {
  const population = [];
  for (let i = 0; i < size; i++) {
    const s = new Strategy(i + 1);
    s.normalize();
    population.push(s);
  }
  return population;
}

// Simple decision making by weights
function evaluateMove(board, row, col, strategy) {
  // Basid heuristic value
  let score = 0;

  // Preference playing on the center area of the board
  const center = Math.floor(board.length / 2);
  const distFromCenter = Math.abs(row - center) + Math.abs(col - center);
  score += strategy.weights.center * (1 / (distFromCenter + 1));

  // Defense: if the enemy is next to the ai
  for (const [dx, dy] of DIRECTIONS_8) {
    const nr = row + dx,
      nc = col + dy;
    if (board[nr] && board[nr][nc] && board[nr][nc] !== '') {
      score += strategy.weights.defense * 0.5;
    }
  }

  // Add randomness
  score += strategy.weights.randomness * Math.random() * 0.1;

  return score;
}

function geneticAIMove(board, boardSize, aiMark, humanMark, strategy) {
  let bestMove = null;
  let bestScore = -Infinity;

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (board[row][col] === '') {
        const score = evaluateMove(board, row, col, strategy);
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
