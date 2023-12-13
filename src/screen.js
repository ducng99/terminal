import { sleep } from "./utils";

/**
 * @typedef {Object} PrintOptions
 * @property {number} preDelay Delay before printing
 * @property {number} postDelay Delay after printing
 * @property {number} printDelay Delay between each character
 */

/**
 * @type {PrintOptions}
 */
const DEFAULT_PRINT_OPTIONS = {
    preDelay: 0,
    postDelay: 0,
    printDelay: 30
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
        outputElem.classList.add('typer', 'active');

        screen.appendChild(outputElem);

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
     * @returns {Promise<string>} The user's input or rejects if the user cancels.
     */
    window.s_prompt = (promptSymbol = '') => {
        return new Promise((resolve, reject) => {
            // Disable active cursor
            screen.querySelectorAll('.typer.active').forEach(ele => ele.classList.remove('active'));
            // Cancel previous prompts
            // TODO: Should we queue prompts instead?
            screen.querySelectorAll('.input[contenteditable="true"]').forEach(ele => ele.dispatchEvent(new Event('cancel')));

            const inputElem = document.createElement('span');
            inputElem.classList.add('input');
            inputElem.contentEditable = true;
            inputElem.dataset.promptSymbol = promptSymbol;

            inputElem.addEventListener('keydown', (event) => {
                event.stopPropagation();

                if (event.key === 'Enter') {
                    event.preventDefault();

                    const command = inputElem.innerText;
                    event.currentTarget.contentEditable = false;

                    resolve(command);
                }
                else if (event.key === 'c' && event.ctrlKey) {
                    event.currentTarget.contentEditable = false;

                    reject();
                }

                // Scroll to bottom of screen
                window.scrollTo(0, screen.scrollHeight);
            });

            inputElem.addEventListener('cancel', (event) => {
                event.currentTarget.contentEditable = false;

                reject();
            });

            screen.appendChild(inputElem);
            inputElem.focus();
        });
    }

    window.s_clear = () => {
        screen.replaceChildren();
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
