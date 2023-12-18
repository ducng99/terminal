export class CommandHistory {
    index = -1;
    /** @type {string[]} */
    commands = [];
    currentCommand = null;

    constructor() {
        this.commands = localStorage.getItem("commandHistory") ? JSON.parse(localStorage.getItem("commandHistory")) : [];
        this.index = this.commands.length;
    }

    add(command) {
        // Keep only 100 entries
        if (this.commands.length >= 100) {
            this.commands.shift();
        }

        this.commands.push(command);
        localStorage.setItem("commandHistory", JSON.stringify(this.commands));
        this.index = this.commands.length;
    }

    getPrevious(currentCommand = "") {
        if (this.currentCommand === null) {
            this.currentCommand = currentCommand;
        }

        if (this.index > 0) {
            this.index--;
        }

        return this.commands[this.index] ?? null;
    }

    getNext() {
        if (this.index < this.commands.length) {
            this.index++;
        }

        if (this.index === this.commands.length) {
            return this.getCurrentCommand();
        }

        return this.commands[this.index];
    }

    getCurrentCommand() {
        const tmp = this.currentCommand;
        this.currentCommand = null;
        return tmp;
    }
}
