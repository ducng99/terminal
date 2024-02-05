import * as chat_conn from "./connection.js";
import { CODE_SUCCESS } from "./constants.js";
import { handleCommand } from "./commands.js";

/**
 * @typedef {Object} InputHandlerResult
 * @property {number} code
 * @property {string | undefined} message
 */

/**
 * Handles user input.
 * @param {string} input 
 * @returns {InputHandlerResult}
 */
export function handleInput(input) {
    input = input.trim();
    const firstChar = input.charAt(0);

    switch (firstChar) {
        case '/':
            {
                const command = input.substring(1).split(' ')[0];
                const params = input.substring(1 + command.length + 1);
                return handleCommand(command, params);
            }
        case '@':
            {
                const username = input.substring(1).split(' ')[0];
                const message = input.substring(1 + username.length + 1);
                return handleSwitchDirectChannel(username, message);
            }
        case '#':
            {
                const channel = input.substring(1).split(' ')[0];
                const message = input.substring(1 + channel.length + 1);
                return handleSwitchMultiChannel(channel, message);
            }
        default:
            return handleSendMessage(input);
    }
}

/**
 * Handles sending message
 * @param {string} message 
 * @returns {InputHandlerResult}
 */
function handleSendMessage(message) {
    const packet = JSON.stringify({
        type: 'sendMessage',
        data: message,
    });

    chat_conn.connection.send(packet);

    return { code: CODE_SUCCESS };
}

/**
 * Handles switching to a multi channel
 * @param {string} channel 
 * @param {string|undefined} message Message to send after joining channel
 * @returns {InputHandlerResult}
 */
function handleSwitchMultiChannel(channel, message) {
    const packet = JSON.stringify({
        type: 'switchMultiChannel',
        data: channel,
        additionalData: {
            message,
        },
    });

    chat_conn.connection.send(packet);

    return { code: CODE_SUCCESS };
}

/**
 * Handles switching to a direct channel
 * @param {string} username Target user to chat with 
 * @param {string|undefined} message Message to send after joining channel
 * @returns {InputHandlerResult}
 */
function handleSwitchDirectChannel(username, message) {
    const packet = JSON.stringify({
        type: 'switchDirectChannel',
        data: username,
        additionalData: {
            message,
        },
    });

    chat_conn.connection.send(packet);

    return { code: CODE_SUCCESS };
}
