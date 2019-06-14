const { bufferToUrl } = require('./bufferToUrl.js');

const invisible = `<svg viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg">
  <rect width="1" height="1" fill="#000" opacity="0" />
</svg>`;

// Created by Aneeque Ahmed from the Noun Project 679740
const unknown = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="500" y="500" viewBox="-10 -10 120 120">
  <path fill="#aaa" d="M96.7 47.2l-4.8-8.4v-9.3c0-2.1-1.1-4-2.9-5.1l-8.1-4.7L76 11.5c-1-1.8-3-2.9-5.1-2.9h-9.6l-8.2-4.7c-1.8-1-4.1-1-5.9 0l-8.2 4.7h-9.4c-2.1 0-4 1.1-5.1 2.9l-4.7 8.1 -8.4 4.8c-1.8 1-2.9 3-2.9 5.1v9.6l-4.6 8c-0.5 0.9-0.8 1.9-0.8 2.9s0.3 2 0.8 2.9l4.6 8v9.6c0 2.1 1.1 4 2.9 5.1l8.4 4.8 4.7 8.1c1 1.8 3 2.9 5.1 2.9h9.4l8.2 4.7c0.9 0.5 1.9 0.8 2.9 0.8s2-0.3 2.9-0.8l8.2-4.7H71c2.1 0 4-1.1 5.1-2.9l4.8-8.3 8.1-4.7c1.8-1 2.9-3 2.9-5.1v-9.3l4.8-8.4C97.7 51.2 97.7 49 96.7 47.2zM54.1 70.3h-7.5v-6.4h7.5V70.3zM54.2 55.3V59h-7.6V48.3h3.8c3.1 0 5.7-2.6 5.7-5.7 0-3.1-2.6-5.7-5.7-5.7s-5.7 2.6-5.7 5.7h-7.6c0-7.3 6-13.3 13.3-13.3s13.3 6 13.3 13.3C63.7 48.6 59.7 53.7 54.2 55.3z"/>
</svg>`;

module.exports = {
  invisible: bufferToUrl(invisible, 'image/svg+xml'),
  unknown: bufferToUrl(unknown, 'image/svg+xml')
};
