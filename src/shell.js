import { loadScript } from "./utils";
import { PromptCancelEvent } from "./screen-globals";

/**
 * Command to exit the shell
 */
const EXIT_COMMAND = "exit";

// List of commands and their functions
/** @type {{ [key: string]: (args: string[]) => Promise<any> | any }} */
let commands = {};

export async function loadShell() {
    // Expose functions to the window
    window.shell.registerCommand = registerCommand;
    window.shell.getCommands = getCommands;

    await bootSequence();
    beginShell();
}

async function bootSequence() {
    await shell.print("BOOTING...", { preDelay: 1500, postDelay: 500 });
    await shell.print("\n\n", { printDelay: 0 });

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

        await shell.print("LOADING DEFAULT PROGRAMS...");

        while (!defaultCommandsLoaded) {
            await shell.print(".", { postDelay: 500 });
        }

        if (defaultCommandsLoadError) {
            await shell.print(" ERROR");
        } else {
            await shell.print(" OK");
        }
    }

    await shell.print("\n\n", { printDelay: 0 });
    await shell.print("BOOT COMPLETED!", { postDelay: 1000 });
    await shell.clear();

    await shell.print("Welcome to Old NET.", { preDelay: 700, postDelay: 500 });
    await shell.print("\nType 'help' to get started.");
    await shell.print("\n\n", { printDelay: 0 });
}

async function beginShell() {
    let user_input = "";

    while (user_input !== EXIT_COMMAND) {
        try {
            user_input = await shell.prompt("> ", { onKeyDown: shellPromptKeyDownHandler });
            if (user_input === "" || user_input === EXIT_COMMAND) continue;

            const { command, args } = parseCommand(user_input);
            await runCommand(command, args);
        } catch (ex) {
            // Do nothing when user cancels
        }
    }

    await shell.print("Goodbye!", { postDelay: 2000 });
}

/**
 * Handles key down events in the shell prompt
 * @param {KeyboardEvent} event Key down event
 */
function shellPromptKeyDownHandler(event) {
    switch (event.key) {
        case 'c':
            if (event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey) {
                event.currentTarget.dispatchEvent(new PromptCancelEvent());
            }
            break;
        case 'l':
            if (event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey) {
                event.preventDefault();
                shell.clear();
            }
            break;
        case 'Tab':
            event.preventDefault();
            let autoComplete = autoCompleteCommand(event.currentTarget.textContent);
            if (autoComplete !== "") {
                event.currentTarget.textContent = autoComplete;
            }
            break;
    }
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
 * Auto-completes a command.
 * If there is only one match, returns the match.
 * If there are multiple matches, returns partial match up to the first difference.
 * If there are no matches, returns an empty string.
 * @param {string} command Current user input to auto-complete
 */
function autoCompleteCommand(command) {
    let commands = getCommands();
    let matches = commands.filter(c => c.startsWith(command)).sort((a, b) => a.localeCompare(b));
    console.log(matches);

    if (matches.length === 1) {
        return matches[0];
    } else if (matches.length > 1) {
        let firstMatch = matches[0];
        let lastMatch = matches[matches.length - 1];

        let i = 0;
        while (firstMatch[i] === lastMatch[i]) {
            i++;
        }

        return firstMatch.slice(0, i);
    } else {
        return "";
    }
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
        await shell.print(`Command not found: ${name}\n`);
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
        loadScript("shell/commands/texteditor/texteditor.js"),
        loadScript("shell/commands/dungeon-crawler/dungeon-crawler.js"),
        loadScript("shell/commands/chat/chat.js"),
    ]);
}
