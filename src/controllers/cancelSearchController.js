const { removeFromWaiting } = require('../utils/matchmaking');

module.exports = async function cancel_search(socket) {
  removeFromWaiting(socket);
};
