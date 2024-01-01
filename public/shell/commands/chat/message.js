import { allowPrintServerMessages } from "./connection.js";

// Server messages
/**
 * Server message
 * @typedef {Object} ServerMessageServerMessage
 * @property {string} type
 * @property {string} timestamp
 * @property {string} message
 */
/**
 * Switched channel message
 * @typedef {Object} ServerMessageSwitchedChannel
 * @property {string} type
 * @property {string} timestamp
 * @property {string} channel
 */
/**
 * New user message
 * @typedef {Object} ServerMessageUserMessage
 * @property {string} type
 * @property {string} timestamp
 * @property {string} sender
 * @property {string} message
 */

/**
 * Handles message from server.
 * @param {ServerMessageServerMessage | ServerMessageSwitchedChannel | ServerMessageUserMessage} message
 */
export function handleServerMessage(message) {
    switch (message.type) {
        case 'serverMessage':
            if (allowPrintServerMessages) {
                shell.print(`[${formatTimestamp(message.timestamp)}] SYSTEM: ${message.message}\n`);
            }
            break;
        case 'switchedChannel':
            if (allowPrintServerMessages) {
                shell.print(`[${formatTimestamp(message.timestamp)}] Switched to channel #${message.channel}\n`);
            }
            break;
        case 'userMessage':
            if (allowPrintServerMessages) {
                shell.print(`[${formatTimestamp(message.timestamp)}] <${message.sender}>: ${message.message}\n`);
            }
            break;
        default:
            break;
    }
}

/**
 * Formats UNIX timestamp to 01-Jan 23:01
 * @param {number} timestamp Unix timestamp with miliseconds
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    return new Intl.DateTimeFormat('en-NZ', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).format(date);
}
