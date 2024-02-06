import { handleServerMessage } from "./message.js";

const SERVER_HOST = "ws-chat-server.tomng.dev";
const AUTH_URL = "https://" + SERVER_HOST + "/login";
const WS_URL = "wss://" + SERVER_HOST + "/ws";

/** @type {WebSocket} */
export let connection = null;

export let allowPrintServerMessages = true;

export function setAllowPrintServerMessages(value) {
    allowPrintServerMessages = value;
}

/**
 * Attempts to login to chat server using username.
 * @param {string} username username to login
 * @returns {Promise<{username: string, token: string}>} Updated username and token if successful. New username if provided username was anonymous.
 */
export async function login(username) {
    const response = await fetch(AUTH_URL + "?" + new URLSearchParams({
        username
    }));

    if (response.ok) {
        const info = await response.json();

        return info;
    } else {
        const error = (await response.text()).trim();
        throw new Error("Failed to login: " + error);
    }
}

/**
 * Connects to chat server.
 * @param {string} token A token returned by `login()` to connect with
 * @returns {Promise<WebSocket>} connection if successful
 */
export function connect(token) {
    return new Promise((resolve, reject) => {
        if (connection === null) {
            let _conn = new WebSocket(WS_URL + "?" + new URLSearchParams({
                token
            }));

            _conn.addEventListener("open", () => {
                connection = _conn;

                _conn.addEventListener("message", (msg) => {
                    try {
                        let message = JSON.parse(msg.data);
                        message.messages.forEach(handleServerMessage);
                    } catch (ex) {
                        console.error(ex);
                    }
                });

                _conn.addEventListener("close", () => {
                    shell.print("Connection closed.\n");
                    connection = null;
                });

                resolve(connection);
            });

            _conn.addEventListener("error", (err) => {
                connection = null;
                reject(err);
            });
        } else {
            resolve(connection);
        }
    });
}

export function close() {
    if (connection !== null) {
        connection.close(1000, "User closing connection.");
    }
}

