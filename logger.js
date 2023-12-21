const logger = console;
logger.level = 'error';

const logFormatter = (level, message) => `${level.toUpperCase()} - ${message}`;

logger.error = (message) => {
  console.error(logFormatter('error', message));
};
