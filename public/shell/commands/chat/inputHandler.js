/**
 * @typedef {Object} InputHandlerResult
 * @property {number} code
 */

import * as chat_conn from "./connection.js";
import { CODE_EXIT, CODE_SUCCESS } from "./constants.js";

/**
 * Handles user input.
 * @returns {InputHandlerResult}
 */
export function handleInput(input) {
    const firstChar = input.charAt(0);

    switch (firstChar) {
        case '/':
            const command = input.substring(1);
            return handleCommand(command);
        case '@':
            const target = input.substring(1);
            break;
        case '#':
            const channel = input.substring(1);
            return handleSwitchChannel(channel);
        default:
            return handleSendMessage(input);
    }
}

/**
 * Handles command
 * @returns {InputHandlerResult}
 */
function handleCommand(command) {
    switch (command) {
        case 'help':
            return { code: CODE_SUCCESS };
        case 'exit':
            chat_conn.close();
            return { code: CODE_EXIT };
        default:
            break;
    }
}

/**
 * Handles sending message
 */
function handleSendMessage(message) {
    const packet = JSON.stringify({
        type: 'sendMessage',
        data: message,
    });

    chat_conn.connection.send(packet);

    return { code: CODE_SUCCESS };
}

function handleSwitchChannel(channel) {
    const packet = JSON.stringify({
        type: 'switchChannel',
        data: channel,
    });

    chat_conn.connection.send(packet);

    return { code: CODE_SUCCESS };
}
