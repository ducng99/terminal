import { setupScreen } from './src/screen';
import { loadShell } from './src/shell';
import './style.css'

let titleShowingCursor = false;
setInterval(function() {
    document.title = (titleShowingCursor = !titleShowingCursor) ? "Terminal" : "Terminal■";
}, 500);

document.querySelector('#app').innerHTML = `
  <div id="overlay"></div>
  <div id="screen"></div>
`;

setupScreen(document.querySelector('#screen'));

loadShell();
