/* eslint-disable no-console */
// frontend/src/utils/devLogger.ts
// Simple logger wrapper that only emits logs in development mode (Vite/DEV or NODE_ENV=development)
const isDev = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV) || import.meta.env?.MODE === 'development';

export const dev = {
  log: (...args: unknown[]) => { if (isDev) console.log(...args); },
  info: (...args: unknown[]) => { if (isDev) console.info(...args); },
  warn: (...args: unknown[]) => { if (isDev) console.warn(...args); },
  error: (...args: unknown[]) => { if (isDev) console.error(...args); },
  group: (...args: unknown[]) => { if (isDev && console.group) console.group(...args); },
  groupEnd: () => { if (isDev && console.groupEnd) console.groupEnd(); },
};

export default dev;
