const { promisify } = require('util');
const path = require('path');
const zlib = require('zlib');
const fs = require('fs-extra');
const root = require('rootrequire');
const { createCanvas, loadImage } = require('canvas');
const pngToIco = require('png-to-ico');
const icnsConvert = require('@fiahfy/icns-convert');

const name = path.resolve(root, 'assets/icon.svgz');

const read = fs.readFile;
const write = fs.outputFile;
const dist = file => path.resolve(root, 'dist', file);
const misc = file => path.resolve(root, 'third-party', file);

const unzip = async name => promisify(zlib.unzip)(await read(name));

function compress() {
  // this one is only used manually... otherwise some
  // errors need to be handled here
  fs.createReadStream('./assets/icon-1000.svg')
    .pipe(zlib.createGzip({ level: 9 }))
    .pipe(fs.createWriteStream(name));
}

async function render(svg, size) {
  const img = await loadImage(svg);
  img.width = img.height = size;
  const canvas = createCanvas(size, size);
  canvas.getContext('2d').drawImage(img, 0, 0);

  return await canvas.toBuffer('image/png');
}

async function createIco(svg) {
  return await pngToIco(await render(svg, 256));
}

async function createIcns(svg) {
  return await icnsConvert([
    await render(svg, 16),
    await render(svg, 32),
    await render(svg, 64),
    await render(svg, 128),
    await render(svg, 256),
    await render(svg, 512),
    await render(svg, 1024)
  ]);
}

async function prepare() {
  const svg = await unzip(name);

  await write(dist('icon.svg'), svg);
  await write(dist('icon.png'), await render(svg, 512));
  await write(dist('icon.ico'), await createIco(svg));
  await write(dist('icon.icns'), await createIcns(svg));
  await write(misc('icon.png'), await render(svg, 512));
}

module.exports = {
  compress,
  prepare,
  render: async () => {
    const svg = await unzip(name);
    await write(misc('icon.png'), await render(svg, 512));
  },
  path: (() => {
    if (process.platform === 'win32') {
      return dist('icon.ico');
    }

    if (process.platform === 'darwin') {
      return dist('icon.icns');
    }
  })()
};
