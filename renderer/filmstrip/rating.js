const log = require('../../tools/log.js')('filmstrip-rating');
const exiftool = require('../exiftool-child.js');

function ratingControl(rating) {
  function star(setTo, isFull = false) {
    const el = document.createElement('span');
    el.setAttribute('data-rate', setTo);
    el.appendChild(document.createTextNode(isFull ? '★' : '☆'));

    return el;
  }

  return Array.apply(null, new Array(5)).map((n, i) => {
    return star(i + 1, i + 1 <= rating);
  });
}

async function setRating(filepath, rating) {
  return await exiftool.setRating(filepath, rating);
}

function render(elem, filepath, rating, events) {
  elem.innerHTML = '';

  const fragment = document.createDocumentFragment();

  ratingControl(rating).forEach((el, idx) => {
    el.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      setRating(filepath, idx + 1).then(data => {
        log.info('rating response', data);

        render(elem, filepath, idx + 1);
      }).catch(err => {
        log.error(err);
        events.emit('error', err);
      });
    });

    fragment.appendChild(el);
  });

  elem.appendChild(fragment);
}

module.exports = function ({ filepath, meta, events }) {
  const elem = document.createElement('div');
  elem.className = 'rating';
  elem.setAttribute('data-rating', meta.rating);

  render(elem, filepath, meta.rating, events);

  return elem;
};
