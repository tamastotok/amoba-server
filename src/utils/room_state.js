const endedRooms = new Set();
const PENDING_ROOMS = new Map(); // roomId → timeoutId

module.exports = { endedRooms, PENDING_ROOMS };
