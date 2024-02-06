import { CODE_ERROR, CODE_EXIT, CODE_SUCCESS } from './constants.js';
import * as chat_conn from './connection.js';

/**
 * Handles command
 * @param {string} command
 * @param {string} params
 * @returns {InputHandlerResult}
 */
export function handleCommand(command, params) {
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
