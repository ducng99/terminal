import { allowPrintServerMessages } from "./connection.js";
import { CHANNEL_TYPES } from "./constants.js";

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
 * @property {CHANNEL_TYPES} channelType
 * @property {string} channelName
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
                shell.print(`[${formatTimestamp(message.timestamp)}] Joined channel ${message.channel}\n`);
            }
            break;
        case 'userMessage':
            onNewUserMessage(message);
            break;
        default:
            break;
    }
}

/**
 * Formats UNIX timestamp to 23:01
 * @param {number} timestamp Unix timestamp with miliseconds
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    return new Intl.DateTimeFormat('en-NZ', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).format(date);
}

/**
 * Handles new user message.
 * @param {ServerMessageUserMessage} message
 * @returns {void}
 */
function onNewUserMessage(serverMessage) {
    if (allowPrintServerMessages) {
        let printString = `[${formatTimestamp(serverMessage.timestamp)}] `;

        switch (serverMessage.channelType) {
            case CHANNEL_TYPES.DIRECT:
                printString += `@${serverMessage.sender}: `;
                break;
            case CHANNEL_TYPES.MULTI:
                printString += `${serverMessage.channelName} <${serverMessage.sender}>: `;
                break;
        }

        printString += `${serverMessage.message}\n`;
        shell.print(printString);
    }
}
