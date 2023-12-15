import { sleep } from "./utils";

/**
 * @typedef {Object} PrintOptions
 * @property {number} preDelay Delay before printing. Defaults to 0.
 * @property {number} postDelay Delay after printing. Defaults to 0.
 * @property {number} printDelay Delay between each character. Defaults to 30.
 * @property {boolean} printBeforeActivePrompt Whether to print before the active prompt. Defaults to `true`.
 */

/**
 * @type {PrintOptions}
 */
const DEFAULT_PRINT_OPTIONS = {
    preDelay: 0,
    postDelay: 0,
    printDelay: 30,
    printBeforeActivePrompt: true,
}

/**
 * @param {HTMLElement} screen Screen element
 */
export const setupScreen = (screen) => {
    /**
     * Prints text to the screen
     * @param {string} text
     * @param {PrintOptions} options
     */
    window.s_print = async (text, options) => {
        const _options = {
            ...DEFAULT_PRINT_OPTIONS,
            ...options
        };

        // Disable active cursor
        screen.querySelectorAll('.typer.active').forEach(ele => ele.classList.remove('active'));

        const outputElem = document.createElement('span');
        outputElem.classList.add('typer');

        let activeInputElem = null;

        if (_options.printBeforeActivePrompt) {
            activeInputElem = screen.querySelector('.input[contenteditable="true"]:last-of-type');
        }

        // If there is no active input prompt, we can add active cursor to this print.
        // Otherwise, we will have two active cursors.
        if (!activeInputElem) {
            outputElem.classList.add('active');
        }

        screen.insertBefore(outputElem, activeInputElem);

        await sleep(_options.preDelay);

        for (let i = 0; i < text.length; i++) {
            outputElem.textContent += text[i];
            await sleep(_options.printDelay);
        }

        await sleep(_options.postDelay);
    }

    /**
     * Prompts the user for input.
     * @param {string} promptSymbol Prompt symbol to appear before receiving input. Eg. "> "
     * @param {boolean} removeAfter Whether to remove the prompt from the screen after receiving input or cancelled.
     * @returns {Promise<string>} The user's input or rejects if the user cancels.
     */
    window.s_prompt = (promptSymbol = '', removeAfter = false) => {
        return new Promise((resolve, reject) => {
            // Disable active cursor
            screen.querySelectorAll('.typer.active').forEach(ele => ele.classList.remove('active'));
            // Cancel previous prompts
            // TODO: Should we queue prompts instead?
            screen.querySelectorAll('.input[contenteditable="true"]').forEach(ele => ele.dispatchEvent(new PromptCancelEvent()));

            const inputElem = document.createElement('span');
            inputElem.classList.add('input');
            inputElem.contentEditable = true;
            inputElem.dataset.promptSymbol = promptSymbol;

            const cancelInput = (event) => {
                if (event && event.detail?.remove) {
                    event.currentTarget.remove();
                } else {
                    event.currentTarget.contentEditable = false;
                }

                reject(new Error('Cancelled'));
            }

            inputElem.addEventListener('keydown', (event) => {
                event.stopPropagation();

                if (event.key === 'Enter') {
                    event.preventDefault();

                    const command = inputElem.innerText;
                    inputElem.appendChild(document.createElement('br'));
                    event.currentTarget.contentEditable = false;

                    resolve(command);

                    if (removeAfter) {
                        event.currentTarget.remove();
                    }
                } else if (event.ctrlKey && event.key === 'c' && !event.shiftKey && !event.altKey && !event.metaKey) {
                    event.currentTarget.dispatchEvent(new PromptCancelEvent({ remove: removeAfter }));
                } else if (event.ctrlKey && event.key === 'l' && !event.shiftKey && !event.altKey && !event.metaKey) {
                    event.preventDefault();
                    s_clear();
                }

                // Scroll to bottom of screen
                window.scrollTo(0, screen.scrollHeight);
            });

            inputElem.addEventListener('cancel', cancelInput);

            screen.appendChild(inputElem);
            inputElem.focus();
        });
    }

    /**
     * Clears the screen, except for the active prompt.
     */
    window.s_clear = () => {
        screen.querySelectorAll(':not(.input[contenteditable="true"])').forEach(ele => ele.remove());
    };

    /**
     * Cancels all active prompts.
     * @param {boolean} remove Whether to remove the prompt from the screen.
     */
    window.s_cancelPrompt = (remove = false) => {
        screen.querySelectorAll('.input[contenteditable="true"]').forEach(ele => {
            ele.dispatchEvent(new PromptCancelEvent({ remove }));
        });
    };

    // Focus on active input prompt if present
    const focusPrompt = () => {
        const prompt = screen.querySelector('.input[contenteditable="true"]:last-of-type');
        if (prompt) {
            prompt.focus();

            // Moves to end of prompt
            const range = document.createRange();
            range.selectNodeContents(prompt);
            range.collapse(false);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };
    document.documentElement.addEventListener('keydown', focusPrompt);
    document.documentElement.addEventListener('mousedown', focusPrompt);
}

class PromptCancelEvent extends CustomEvent {
    constructor(options = {}) {
        super('cancel', {
            detail: {
                remove: options.remove
            }
        });
    }
}
