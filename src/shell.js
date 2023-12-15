import { loadScript } from "./utils.js";

/**
 * Command to exit the shell
 */
const EXIT_COMMAND = "exit";

// List of commands and their functions
/** @type {{ [key: string]: (args: string[]) => Promise<any> | any }} */
let commands = {};

export async function loadShell() {
    // Expose functions to the window
    window.s_registerCommand = registerCommand;
    window.s_getCommands = getCommands;

    await bootSequence();
    beginShell();
}

async function bootSequence() {
    await s_print("BOOTING...", { preDelay: 1500, postDelay: 500 });
    await s_print("\n\n", { printDelay: 0 });

    // Load default commands
    {
        let defaultCommandsLoaded = false;
        let defaultCommandsLoadError = false;

        loadDefaultCommands()
            .catch(() => {
                defaultCommandsLoadError = true;
            })
            .finally(() => {
                defaultCommandsLoaded = true;
            });

        await s_print("LOADING DEFAULT PROGRAMS...");

        while (!defaultCommandsLoaded) {
            await s_print(".", { postDelay: 500 });
        }

        if (defaultCommandsLoadError) {
            await s_print(" ERROR");
        } else {
            await s_print(" OK");
        }
    }

    await s_print("\n\n", { printDelay: 0 });
    await s_print("BOOT COMPLETED!", { postDelay: 1000 });
    await s_clear();

    await s_print("Welcome to Old NET.", { preDelay: 700, postDelay: 500 });
    await s_print("\nType 'help' to get started.");
    await s_print("\n\n", { printDelay: 0 });
}

async function beginShell() {
    let user_input = "";

    while (user_input !== EXIT_COMMAND) {
        try {
            user_input = await s_prompt("> ");
            if (user_input === "" || user_input === EXIT_COMMAND) continue;

            const { command, args } = parseCommand(user_input);
            await runCommand(command, args);
        } catch (ex) {
            // Do nothing when user cancels
        }
    }

    await s_print("Goodbye!", { postDelay: 2000 });
}

/**
 * Add a command to the shell. If a command with the same name already exists, it will NOT be overwritten.
 * @param {string} name Name of the command
 * @param {(args: string[]) => Promise<void>} func Function to run when the command is called
 */
function registerCommand(name, func) {
    if (name in commands) {
        console.warn(`Command already exists: ${name}`);
    } else {
        commands[name] = func;
    }
}

/**
 * Get a list of commands
 * @returns {string[]} List of commands
 */
function getCommands() {
    return Object.keys(commands);
}

/**
 * Runs a command
 * @param {string} name Name of the command
 * @param {string[]} args Arguments passed to the command
 */
async function runCommand(name, args) {
    if (name in commands) {
        await commands[name](args);
    } else {
        await s_print(`Command not found: ${name}\n`);
    }
}

/**
 * Parses a command string into a command and arguments
 * @param {string} commandString Command string to parse
 * @returns {{ command: string, args: string[] }} Command and arguments
 */
function parseCommand(commandString) {
    // Regular expression to match command and arguments
    // This will match either a sequence of non-space, non-quote characters,
    // or a sequence of characters inside double quotes (supporting escaped quotes)
    let regex = /[^\s"']+|"([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'/g;
    let parts = commandString.match(regex);

    // The first part is the command
    let command = parts.splice(0, 1)[0];

    // The rest are the arguments
    // Remove quotes from arguments
    let args = parts.map(arg => arg.startsWith('"') ? arg.slice(1, -1).replace(/\\"/g, '"') : arg);

    return { command, args };
}

/**
 * Loads default commands
 * @returns {Promise<void[]>} Promise that resolves when all commands are loaded
 */
function loadDefaultCommands() {
    return Promise.all([
        loadScript("shell/commands/help/help.js"),
        loadScript("shell/commands/clear/clear.js"),
    ]);
}
