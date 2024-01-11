import { CODE_ERROR, CODE_EXIT } from "./constants.js";
import { handleInput } from "./inputHandler.js";
import * as chat_connection from "./connection.js";

async function main() {
    await shell.print(`Welcome to simple websocket chat program.

Messages are sent in raw text.
Type '/help' to know how to use this program.
Type '/exit' to exit this program.

`);

    let name = "";
    let token = null;

    do {
        await shell.print("Enter your name: ");

        try {
            name = await shell.prompt();

            if (name === "") {
                name = "Anonymous";
            }

            const loginInfo = await attemptLogin(name);

            if (loginInfo !== null) {
                name = loginInfo.username;
                token = loginInfo.token;
            }
        } catch (ex) {
            // User cancelled. Just exit the program.
            return;
        }
    } while (token === null);

    if (!await attemptConnect(token)) {
        return;
    }

    let user_message_input = "";
    let should_exit = false;

    while (!should_exit && chat_connection.connection !== null) {
        try {
            user_message_input = await shell.prompt(`\n${name}> `, { removeAfter: true });

            const handleResult = handleInput(user_message_input);

            switch (handleResult.code) {
                case CODE_EXIT:
                    should_exit = true;
                    break;
                case CODE_ERROR:
                    if (handleResult.message) {
                        await shell.print(handleResult.message + "\n");
                    }
                    break;
                default:
                    break;
            }
        } catch (ex) {
            // Do nothing when user cancels
        }
    }

    await shell.print("Bye!\n");
}

/**
 * Attempts to login to chat server.
 * @param {string} username
 * @returns {Promise<{ username: string, token: string }>} login info if successful
 */
async function attemptLogin(username) {
    let loggingIn = true;
    let loginSuccess = false;
    let loginInfo = null;
    let loginErrorMsg = "";

    chat_connection.login(username)
        .then((info) => {
            loginSuccess = true;
            loginInfo = info;
        }).catch((err) => {
            loginErrorMsg = err.message;
        }).finally(() => {
            loggingIn = false;
        });

    await shell.print("Logging in...");

    while (loggingIn) {
        await shell.sleep(1000);
        await shell.print(".");
    }

    if (loginSuccess) {
        await shell.print(" OK\n");
    } else {
        await shell.print(" Failed\n");
        await shell.print(loginErrorMsg + "\n");
        return null;
    }

    return loginInfo;
}

/**
 * Attempts to connect to chat server.
 * @param {string} token
 */
async function attemptConnect(token) {
    let connecting = true;
    let connectSuccess = false;

    chat_connection.setAllowPrintServerMessages(false);

    chat_connection.connect(token)
        .then((conn) => {
            connectSuccess = true;
            conn.addEventListener('close', () => {
                shell.cancelPrompt();
            });
        }).catch((err) => {
            console.error(err);
        }).finally(() => {
            connecting = false;
        });

    await shell.print("Connecting to server...");

    while (connecting) {
        await shell.sleep(1000);
        await shell.print(".");
    }

    if (!connectSuccess) {
        await shell.print(" Failed\n");
        await shell.print("Failed to connect to server. Please try again later.\n");
        return false;
    }

    await shell.print(" OK\n");
    chat_connection.setAllowPrintServerMessages(true);
    return true;
}

shell.registerCommand("chat", main);
