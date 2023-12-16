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
    printDelay: 16.6666667,
    printBeforeActivePrompt: true,
}

/**
 * @typedef {Object} PromptOptions
 * @property {boolean} removeAfter Whether to remove the prompt from the screen after receiving input or cancelled. Defaults to `false`.
 * @property {boolean} multiLine Whether to allow multi-line input. Use `onKeyDown` to specify when to stop reading user input. Defaults to `false`.
 * @property {(event: KeyboardEvent) => void | undefined} onKeyDown Custom keydown event handler.
 */

/**
 * @type {PromptOptions}
 */
const DEFAULT_PROMPT_OPTIONS = {
    removeAfter: false,
    multiLine: false,
    onKeyDown: undefined,
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
     * @param {PromptOptions} options
     * @returns {Promise<string>} The user's input or rejects if the user cancels.
     */
    window.s_prompt = (promptSymbol = '', options = {}) => {
        const _options = {
            ...DEFAULT_PROMPT_OPTIONS,
            ...options
        };

        return new Promise((resolve, reject) => {
            // Disable active cursor
            screen.querySelectorAll('.typer.active').forEach(ele => ele.classList.remove('active'));
            // Cancel previous prompts
            // TODO: Should we queue prompts instead?
            screen.querySelectorAll('.input[contenteditable="true"]').forEach(ele => ele.dispatchEvent(new PromptCancelEvent()));

            const inputElem = document.createElement('span');
            inputElem.classList.add('input', 'blink');
            inputElem.contentEditable = true;
            inputElem.dataset.promptSymbol = promptSymbol;

            inputElem.addEventListener('keydown', (event) => {
                if (_options.onKeyDown) {
                    _options.onKeyDown(event);
                }

                if (event.key === 'Enter') {
                    if (!_options.multiLine) {
                        event.preventDefault();

                        inputElem.appendChild(document.createTextNode('\n'));
                        inputElem.dispatchEvent(new Event('finish'));
                    }
                } else if (event.ctrlKey && event.key === 'c' && !event.shiftKey && !event.altKey && !event.metaKey) {
                    inputElem.dispatchEvent(new PromptCancelEvent({ remove: _options.removeAfter }));
                } else if (event.ctrlKey && event.key === 'l' && !event.shiftKey && !event.altKey && !event.metaKey) {
                    event.preventDefault();
                    s_clear();
                }

                // Scroll to bottom of screen
                window.scrollTo(0, screen.scrollHeight);
            });

            inputElem.addEventListener('finish', function(event) {
                const command = event.currentTarget.innerText;
                event.currentTarget.contentEditable = false;

                resolve(command);

                if (_options.removeAfter) {
                    event.currentTarget.remove();
                }
            });

            inputElem.addEventListener('cancel', function(event) {
                if (event && event.detail?.remove) {
                    event.currentTarget.remove();
                } else {
                    event.currentTarget.contentEditable = false;
                    event.currentTarget.appendChild(document.createTextNode('\n'));
                }

                reject(new Error('Cancelled'));
            });

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
    document.documentElement.addEventListener('keydown', () => {
        const prompt = screen.querySelector('.input[contenteditable="true"]');
        if (prompt) {
            prompt.focus();
        }
    });

    function makeNewLineCharElementBig(charElement) {
        if (charElement.textContent === '\n') {
            charElement.classList.add('showNewLine');
        } else {
            charElement.classList.remove('showNewLine');
        }
    }

    // This takes care of caret blinking on a character, like insert mode.
    // I pray one day to replace all these with CSS `caret-shape: block;`
    document.addEventListener('selectionchange', () => {
        const selection = window.getSelection();

        let foundNewBlinkingChar = false;
        const currentBlinkingChar = screen.querySelector('.input .char.blink');

        if (selection.type === 'Caret' && selection.focusNode) {
            const currentSelectingElement = selection.focusNode;
            const parentSelectingElement = currentSelectingElement.parentElement;

            if (parentSelectingElement.classList.contains('input') && currentSelectingElement.nodeType === Node.TEXT_NODE) {
                // We are selecting a text node under an input element
                // Simply get the character and put it in a child span element to blink
                // Gets the char we are on
                const currentChar = currentSelectingElement.textContent[selection.focusOffset];

                if (currentChar) {
                    parentSelectingElement.classList.remove('blink');
                    // Split the text node into two
                    const rightTextNode = currentSelectingElement.splitText(selection.focusOffset);
                    // Create a new span element for the character
                    const charElem = document.createElement('span');
                    charElem.classList.add('char', 'blink');
                    charElem.textContent = currentChar;
                    makeNewLineCharElementBig(charElem);
                    // Insert the span element before the right text node
                    parentSelectingElement.insertBefore(charElem, rightTextNode);
                    // Remove the char from the text node
                    rightTextNode.textContent = rightTextNode.textContent.substring(1);

                    foundNewBlinkingChar = true;
                }
            } else if (parentSelectingElement.classList.contains('char')) {
                // We are selecting text inside a char element

                const inputElem = parentSelectingElement.parentElement;
                // Get the char we are on
                const currentChar = currentSelectingElement.textContent[selection.focusOffset];

                if (currentChar) {
                    // We are selecting a character inside a char element
                    // Remove the blink class from the parent input element
                    inputElem.classList.remove('blink');

                    if (currentSelectingElement.textContent.length === 1 && !parentSelectingElement.classList.contains('blink')) {
                        // The current char element contains only one character, we can just blink it
                        parentSelectingElement.classList.add('blink');
                        makeNewLineCharElementBig(parentSelectingElement);
                        foundNewBlinkingChar = true;
                    } else if (currentSelectingElement.textContent.length > 1) {
                        // We have more than one character in the current char element
                        // We must create a new char element for the character we are on and place it after the current char element
                        // The text after the current char will be moved back into the parent input element, after the current character

                        // Split the text node into two
                        const rightTextNode = currentSelectingElement.splitText(selection.focusOffset);
                        // Create a new span element for the character
                        const charElem = document.createElement('span');
                        charElem.classList.add('char', 'blink');
                        charElem.textContent = currentChar;
                        makeNewLineCharElementBig(charElem);
                        // Insert the span element after the current char span node
                        inputElem.insertBefore(charElem, parentSelectingElement.nextSibling);
                        // Remove char from right text node
                        rightTextNode.textContent = rightTextNode.textContent.substring(1);
                        // Move right text node to after the new char span node
                        inputElem.insertBefore(rightTextNode, charElem.nextSibling);

                        foundNewBlinkingChar = true;
                    }
                } else if (parentSelectingElement.nextSibling) {
                    // We are not selecting text inside char element, which probably means we are selecting the last character
                    // Now attempts to blink the first character in the next sibling node, which can be a text node or another char element

                    const nextNode = parentSelectingElement.nextSibling;
                    const blinkNextSibling = () => {
                        const nextChar = nextNode.textContent[0];

                        const charElem = document.createElement('span');
                        charElem.classList.add('char', 'blink');
                        charElem.textContent = nextChar;
                        makeNewLineCharElementBig(charElem);
                        inputElem.insertBefore(charElem, nextNode);
                        nextNode.textContent = nextNode.textContent.substring(1);

                        foundNewBlinkingChar = true;
                    }

                    // Remove the blink class from the parent input element
                    inputElem.classList.remove('blink');

                    if (nextNode.nodeType === Node.TEXT_NODE) {
                        blinkNextSibling();
                    } else if (nextNode.nodeType === Node.ELEMENT_NODE && nextNode.classList.contains('char')) {
                        // Blink the character in next sibling char element
                        if (nextNode.textContent.length > 1) {
                            // The next sibling char element contains more than one character, we need to create a new char element with the first character
                            // and put it before the next sibling char element
                            blinkNextSibling();
                        } else if (nextNode.textContent.length === 1 && !nextNode.classList.contains('blink')) {
                            // The next sibling char element has only one character
                            // We can just blink the next sibling char element
                            nextNode.classList.add('blink');
                            makeNewLineCharElementBig(nextNode);
                            foundNewBlinkingChar = true;
                        }
                    } else if (nextNode.nodeType === Node.ELEMENT_NODE && inputElem.lastChild === nextNode) {
                        // This is an unknown element, which is most likely a br element at the end of span element (why????????)
                        // Blink the input element
                        inputElem.classList.add('blink');
                        foundNewBlinkingChar = true;
                    }
                } else {
                    // We are at the end of the input element
                    // Blink the input element
                    parentSelectingElement.parentElement.classList.add('blink');
                    foundNewBlinkingChar = true;
                }
            } else if (currentSelectingElement.nodeType === Node.ELEMENT_NODE && currentSelectingElement.classList.contains('input') && currentSelectingElement.textContent.length === 0) {
                // We are selecting the input element and there is no text in it
                currentSelectingElement.classList.add('blink');
                foundNewBlinkingChar = true;
            } else if (currentSelectingElement.nodeType === Node.TEXT_NODE && selection.focusOffset === currentSelectingElement.textContent.length && parentSelectingElement.lastChild === currentSelectingElement) {
                // We are selecting the last character in the last text node of the input element
                // There is no next sibling node, so we can just blink the input element
                parentSelectingElement.classList.add('blink');
                foundNewBlinkingChar = true;
            }
        } else if (selection.type === 'Range' && selection.focusNode && screen.querySelector('.input[contenteditable="true"]')?.contains(selection.focusNode)) {
            screen.querySelectorAll('.input.blink').forEach(ele => ele.classList.remove('blink'));
            foundNewBlinkingChar = true;
        }

        if (foundNewBlinkingChar && currentBlinkingChar) {
            // Remove blinking character
            currentBlinkingChar.classList.remove('blink');
        }

        screen.querySelectorAll('.input[contenteditable="true"]').forEach(ele => {
            ele.normalize();
        });

        // If new line char element contain more than new line, remove showing
        screen.querySelectorAll('.input .showNewLine').forEach(ele => {
            makeNewLineCharElementBig(ele);
        });
    });
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
