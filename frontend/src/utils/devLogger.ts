/* eslint-disable no-console */
// frontend/src/utils/devLogger.ts
// Simple logger wrapper that only emits logs in local development.
// Avoid import.meta here so Jest can parse this module in CommonJS mode.
const isDev =
  typeof window !== 'undefined'
    ? ['localhost', '127.0.0.1'].includes(window.location.hostname)
    : false;

export const dev = {
  log: (...args: unknown[]) => { if (isDev) console.log(...args); },
  info: (...args: unknown[]) => { if (isDev) console.info(...args); },
  warn: (...args: unknown[]) => { if (isDev) console.warn(...args); },
  error: (...args: unknown[]) => { if (isDev) console.error(...args); },
  group: (...args: unknown[]) => { if (isDev && console.group) console.group(...args); },
  groupEnd: () => { if (isDev && console.groupEnd) console.groupEnd(); },
};

export default dev;
