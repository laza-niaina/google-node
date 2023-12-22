const colorizeText = (text, colorCode) => `\x1b[${colorCode}m${text}\x1b[0m`;
const logger = console;
logger.level = 'error';

const logFormatter = (level, message) => `${level.toUpperCase()} - ${message}`;

const originalError = console.error; // Save the original console.error function

logger.error = (message) => {
	originalError(colorizeText(logFormatter('error', message),31));
};

module.exports = logger;
