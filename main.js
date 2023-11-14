import { setupScreen } from './src/Screen';
import './style.css'

document.querySelector('#app').innerHTML = `
  <div id="overlay"></div>
  <div id="screen"></div>
`;

// Focus on active input prompt if present
const focusPrompt = () => {
    const prompt = document.querySelector('.input[contenteditable="true"]');
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

setupScreen(document.querySelector('#screen'));
