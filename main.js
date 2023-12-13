import { setupScreen } from './src/screen';
import { loadShell } from './src/shell';
import './style.css'

document.querySelector('#app').innerHTML = `
  <div id="overlay"></div>
  <div id="screen"></div>
`;

setupScreen(document.querySelector('#screen'));

loadShell();
