const path = require('path');
const fs = require('fs-extra');
const { dialog } = require('electron').remote;

const name = 'sidebar';
const style = true;

const exiftool = require('../tools/exiftool-child.js');
const dom = require('../tools/dom.js');
const log = require('../../lib/log.js')(name);
const config = require('../../lib/config.js');

//const keyWhitelist = [
//  'Model',
//  'LensID',
//  'FocalLength',
//  'FNumber',
//  'ExposureTime',
//  'ISO',
//  'ExposureMode',
//  'FocusDistance',
//  'ImageSize',
//  'Megapixels',
//  'Orientation',
//  'Temperature',
//  'Artist',
//  'DateTimeOriginal',
//  'FocusDistanceLower',
//  'FocusDistanceUpper',
//  'FocusDistance2',
//  'CameraTemperature',
//  'Artist',
//  'Creator',
//  'OwnerName',
//  'AutoRotate',
//];

const renderKeyValue = ({ key, value }) => {
  return dom.children(
    dom.classname(dom.p(), `${name}-kv`),
    dom.classname(dom.span(`${key}: `), 'metalabel'),
    dom.classname(dom.span(value), 'metavalue')
  );
};

const render = (meta) => {
  const fragment = document.createDocumentFragment();

  for (let i in meta) {
    fragment.appendChild(renderKeyValue({ key: i, value: meta[i]}));
  }

  return fragment;
};

const derive = (meta) => {
  const derived = {};

  // Canon has a lower and upper focus distance, while
  // others have a single value
  if (meta.FocusDistanceLower && meta.FocusDistanceUpper) {
    derived.FocusDistance = meta.FocusDistance ||
      `${meta.FocusDistanceLower} - ${meta.FocusDistanceUpper}`;
  }

  // Sony sometimes has FocusDistance2 instead of FocusDistance
  if (meta.FocusDistance2 && !meta.FocusDistance) {
    derived.FocusDistance = meta.FocusDistance2;
  }

  if (meta.CameraTemperature) {
    derived.Temperature = meta.CameraTemperature;
  }

  // how to define this has changed over time... just use
  // any of these
  derived.Artist = meta.Artist || meta.Creator || meta.OwnerName || undefined;

  derived.Orientation = meta.Orientation || meta.AutoRotate;

  return derived;
};

module.exports = ({ events }) => {
  const elem = dom.div(name);

  async function saveImage({ filepath, imageUrl, name }) {
    const outfile = await dialog.showSaveDialog({
      defaultPath: name
    });

    if (!outfile) {
      // user probably pressed Cancel, so do nothing
      return;
    }

    if (imageUrl === filepath) {
      await log.timing(
        `copy jpeg to ${outfile}`,
        async () => await fs.copy(filepath, outfile)
      );
      return;
    }

    await log.timing(
      `save jpeg preview to ${outfile}`,
      async () => {
        const base64 = imageUrl.split(';base64,').pop();
        const buffer = Buffer.from(base64, 'base64');

        await fs.outputFile(outfile, buffer);
        await exiftool.copyMeta(filepath, outfile);
      }
    );
  }

  async function loadInfo({ filepath, imageUrl }) {
    const [ meta, renderFromRaw ] = await Promise.all([
      log.timing(
        `exif ${filepath}`,
        async () => await exiftool.readFullMeta(filepath)
      ),
      config.getProp('experiments.renderFromRaw')
    ]);

    const allMeta = Object.assign({}, meta, derive(meta));

    const fragment = document.createDocumentFragment();

    [
      { key: 'Model', gui: 'Camera' },
      { key: 'LensID', gui: 'Lens' },
      { key: 'FocalLength', gui: 'Focal length' }, // or FocalLength35efl
      { key: 'FNumber', gui: 'Aperture' },
      { key: 'ExposureTime', gui: 'Shutter' }, // also ExposureCompensation
      { key: 'ISO', gui: 'ISO' },
      { key: 'ExposureMode', gui: 'Mode' },
      { key: 'FocusDistance', gui: 'Focus Distance' },
      { key: 'ImageSize', gui: 'Dimensions' }, // this is sensor size, pre-crop, maybe use DefaultCropSize
      { key: 'Megapixels', gui: 'Megapixels' },
      { key: 'Orientation', gui: 'Orientation' },
      { key: 'Temperature', gui: 'Temperature' },
      { key: 'Artist', gui: 'Artist' },
      { key: 'DateTimeOriginal', gui: 'Timestamp' },
      { key: 'Z-FileSize', gui: 'Size' },
    ].filter(({ key }) => !!allMeta[key]).map(({ key, gui }) => {
      return renderKeyValue({ key: gui, value: allMeta[key] });
    }).forEach(elem => fragment.appendChild(elem));

    const name = path.basename(filepath, path.extname(filepath)) + '.jpg';
    dom.children(
      fragment,
      dom.button('Show all metadata', () => {
        events.emit('modal', { content: render(meta) });
      }),
      dom.button('Save preview image', async () => {
        try {
          await saveImage({ filepath, imageUrl, name });
        } catch (e) {
          events.emit('error', e);
        }
      }),
      renderFromRaw ?
        dom.button('Render from RAW', async () => {
          try {
            const raw = await exiftool.rawRender(filepath);

            events.emit('image:load', {
              filepath: filepath,
              imageUrl: raw,
              rotation: 0
            });
          } catch (e) {
            log.error('render from RAW error:', e);
            events.emit('error', new Error('RAW image is unsupported'));
          }
        }) :
        dom.nill()
    );

    dom.children(dom.empty(elem), fragment);
  }

  events.on('meta:load', loadInfo);

  return { elem, style };
};
