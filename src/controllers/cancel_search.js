const { removeFromWaiting } = require('../utils/matchmaking');

module.exports = async function cancelSearch(socket) {
  removeFromWaiting(socket);
};
