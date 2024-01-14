/**
 * @typedef {Object} InputHandlerResult
 * @property {number} code
 * @property {string | undefined} message
 */

import * as chat_conn from "./connection.js";
import { CODE_EXIT, CODE_SUCCESS, CODE_ERROR } from "./constants.js";

/**
 * Handles user input.
 * @param {string} input 
 * @returns {InputHandlerResult}
 */
export function handleInput(input) {
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
            }
        case '#':
            {
                const channel = input.substring(1).split(' ')[0];
                const message = input.substring(1 + channel.length + 1);
                return handleSwitchChannel(channel, message);
            }
        default:
            return handleSendMessage(input);
    }
}

/**
 * Handles command
 * @param {string} command
 * @param {string} params
 * @returns {InputHandlerResult}
 */
function handleCommand(command, params) {
    switch (command) {
        case 'help':
            return { code: CODE_SUCCESS };
        case 'exit':
            chat_conn.close();
            return { code: CODE_EXIT };
        default:
            return {
                code: CODE_ERROR,
                message: `Unknown command: ${command}`,
            };
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
 * Handles switching channel
 * @param {string} channel 
 * @returns {InputHandlerResult}
 */
function handleSwitchChannel(channel) {
    const packet = JSON.stringify({
        type: 'switchChannel',
        data: channel,
    });

    chat_conn.connection.send(packet);

    return { code: CODE_SUCCESS };
}
