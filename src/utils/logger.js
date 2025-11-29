function tag(label) {
  return `[${label}]`.padEnd(2, ' ');
}

// Unified logger
const log = {
  info: (...msg) => console.log(`${tag('INFO')}`, ...msg),
  warn: (...msg) => console.warn(`${tag('WARN')}`, ...msg),
  error: (...msg) => console.error(`${tag('ERROR')}`, ...msg),

  // Domain-specific logs
  game: (...msg) => console.log(`${tag('GAME')}`, ...msg),
  ai: (...msg) => console.log(`${tag('AI')}`, ...msg),
  human: (...msg) => console.log(`${tag('HUMAN')}`, ...msg),
  db: (...msg) => console.log(`${tag('DB')}`, ...msg),
  server: (...msg) => console.log(`${tag('SERVER')}`, ...msg),
  socket: (...msg) => console.log(`${tag('SOCKET')}`, ...msg),

  // Debug
  debug: (...msg) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${tag('DEBUG')}`, ...msg);
    }
  },
};

module.exports = log;
