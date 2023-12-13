import { loadScript } from "./utils.js";

// List of commands and their functions
/** @type {{ [key: string]: (args: string[]) => Promise<any> | any }} */
let commands = {};

export async function loadShell() {
    window.s_registerCommand = registerCommand;
    window.s_getCommands = getCommands;

    await bootSequence();
    beginShell();
}

async function bootSequence() {
    await s_print("Welcome to OldNet terminal.", { preDelay: 2000, postDelay: 2000 });
    await s_print("\n\n", { printDelay: 0 });
    await s_print("Begin boot sequence", { postDelay: 1000 });

    await s_print("\n", { printDelay: 0 });

    // Load default commands
    {
        let defaultCommandsLoaded = false;
        let defaultCommandsError = false;

        loadDefaultCommands()
            .then(() => { defaultCommandsLoaded = true })
            .catch(() => {
                defaultCommandsLoaded = true;
                defaultCommandsError = true
            });

        await s_print("Loading default apps...");

        while (!defaultCommandsLoaded) {
            await s_print(".", { postDelay: 500 });
        }

        if (defaultCommandsError) {
            await s_print(" ERROR");
        } else {
            await s_print(" OK");
        }
    }

    await s_print("\n", { printDelay: 0 });
    await s_print("Boot sequence completed", { postDelay: 1000 });
}

async function beginShell() {
    let user_input = "";

    while (user_input !== "exit") {
        try {
            user_input = await s_prompt("> ");
            if (user_input === "") continue;
            const [command, ...args] = user_input.split(" ");

            await runCommand(command, args);
        } catch (ex) {
            // Do nothing when user cancels
        }
    }
}

/**
 * Add a command to the shell
 * @param {string} name Name of the command
 * @param {(args: string[]) => Promise<void>} func Function to run when the command is called
 */
function registerCommand(name, func) {
    commands[name] = func;
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
 * Loads default commands
 * @returns {Promise<void[]>} Promise that resolves when all commands are loaded
 */
function loadDefaultCommands() {
    return Promise.all([
        loadScript("shell/commands/help.js"),
    ]);
}
