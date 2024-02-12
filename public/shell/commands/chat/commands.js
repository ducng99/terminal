import { CODE_ERROR, CODE_EXIT, CODE_SUCCESS } from './constants.js';
import * as chat_conn from './connection.js';

const HELP_MESSAGE = `Available commands:
/help - Show this help message
/exit - Exit the chat program

Channels navigation:
#<channel_name> - Join a channel. Eg. #general
@<username> - Join a private channel with a user. Eg. @tom
`;

/**
 * Handles command
 * @param {string} command
 * @param {string} params
 * @returns {InputHandlerResult}
 */
export async function handleCommand(command, params) {
    switch (command) {
        case 'help':
            await shell.print(HELP_MESSAGE);
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
