/** @type {HTMLElement} */
let screen = null

/**
 * @param {HTMLElement} screenElement
 */
export const setupScreen = (screenElement) => {
    screen = screenElement;

    print('Hello, World!');
    prompt();
}

/**
 * Prints text to the screen
 * @param {string} text
 */
export const print = (text) => {
    const outputElem = document.createElement('div');
    outputElem.innerText = text;

    screen.appendChild(outputElem);
}

/**
 * Prompts the user for input.
 * @returns {Promise<string>} The user's input or rejects if the user cancels.
 */
export const prompt = () => {
    return new Promise((resolve, reject) => {
        const inputElem = document.createElement('span');
        inputElem.classList.add('input');
        inputElem.contentEditable = true;

        inputElem.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();

                const command = inputElem.innerText;
                event.currentTarget.contentEditable = false;

                resolve(command);
                prompt();
            }
            else if (event.key === 'c' && event.ctrlKey) {
                event.preventDefault();
                event.currentTarget.contentEditable = false;

                reject();
                prompt();
            }
        });

        screen.appendChild(inputElem);

        inputElem.focus();
    });
}
