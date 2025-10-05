const Boards = require('../models/Boards');
const { simpleAIMove } = require('./simpleAI');

module.exports = async function request_ai_move(socket, io, data) {
  try {
    const { roomId, playerMark } = data;
    if (!roomId) return;

    const boardDoc = await Boards.findOne({ roomId }).lean();
    if (!boardDoc) {
      console.log(`No board for room ${roomId}`);
      return;
    }

    const size = boardDoc.boardSize;
    const board = Array.from({ length: size }, () => Array(size).fill(''));
    for (const p of boardDoc.positions || []) {
      board[p.row][p.col] = p.value; // 'X' | 'O'
    }

    // Marks
    const aiMark = playerMark === 'X' ? 'O' : 'X';
    const humanMark = playerMark;

    // Calculating AI step
    const move = simpleAIMove(board, size, aiMark, humanMark);
    if (!move) return;

    // AI mark
    move.value = aiMark;

    // DB update (AI step + who is next)
    await Boards.updateOne(
      { roomId },
      {
        $push: {
          positions: { row: move.row, col: move.col, value: aiMark },
        },
        $set: { whoIsNext: humanMark },
      }
    );

    // Send data back to client
    io.to(roomId).emit('ai-move', move);
  } catch (err) {
    console.error('AI move error:', err);
  }
};
