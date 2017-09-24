import './index.scss';
import 'normalize.css';

import createMenu from '../../components/menu';

let menu = createMenu(['Home', 'About', 'Blog', 'Contacts'], 'main-menu');

document.body.appendChild(menu);

console.log('In index.js');