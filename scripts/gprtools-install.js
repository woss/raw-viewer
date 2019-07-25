/* eslint-disable no-console */

const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);
const fs = require('fs-extra');
const fetch = require('node-fetch');

const { gprtools, gprtoolsDir } = require('../lib/third-party.js');

const version = '1.0.0-rc1.0.0';

const urls = {
  win32: `https://github.com/catdad-experiments/gpr-tools-release/releases/download/${version}/gpr_tools_windows.exe`,
  osx:   `https://github.com/catdad-experiments/gpr-tools-release/releases/download/${version}/gpr_tools_osx`,
  linux: `https://github.com/catdad-experiments/gpr-tools-release/releases/download/${version}/gpr_tools_linux`,
};

const responseStream = async url => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`failed response: ${res.status} ${res.statusText}`);
  }

  return res.body;
};

require('./lib.run.js')(`gpr_tools v${version}`, async () => {
  await fs.ensureDir(gprtoolsDir);

  if (!urls[process.platform]) {
    throw new Error(`${process.platform} is not supported`);
  }

  const body = await responseStream(urls[process.platform]);

  await pipeline(body, fs.createWriteStream(gprtools));
});

