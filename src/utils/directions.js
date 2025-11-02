// Primary 4 directions for pattern checking (win logic)
const DIRECTIONS_4 = [
  [1, 0], // ↓  south
  [0, 1], // →  east
  [1, 1], // ↘  southeast
  [1, -1], // ↙  southwest
];

// All 8 directions for neighbor scanning
const DIRECTIONS_8 = [
  [1, 0], // ↓  south
  [-1, 0], // ↑  north
  [0, 1], // →  east
  [0, -1], // ←  west
  [1, 1], // ↘  southeast
  [1, -1], // ↙  southwest
  [-1, 1], // ↗  northeast
  [-1, -1], // ↖  northwest
];

module.exports = { DIRECTIONS_4, DIRECTIONS_8 };
