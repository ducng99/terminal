import { setupScreen } from './src/screen';
import './style.css'

document.querySelector('#app').innerHTML = `
  <div id="overlay"></div>
  <div id="screen"></div>
`;

setupScreen(document.querySelector('#screen'));

