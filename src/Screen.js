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
 * @param {string} text
 */
export const print = (text) => {
    const outputElem = document.createElement('div');
    outputElem.innerText = text;

    screen.appendChild(outputElem);
}

export const prompt = () => {
    const inputElem = document.createElement('span');
    inputElem.classList.add('input');
    inputElem.contentEditable = true;

    inputElem.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();

            const command = inputElem.innerText;
            event.currentTarget.contentEditable = false;

            prompt();
        }
    });

    screen.appendChild(inputElem);

    inputElem.focus();
}
