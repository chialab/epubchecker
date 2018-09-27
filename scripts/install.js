const fs = require('fs');
const path = require('path');
const request = require('request');
const unzip = require('unzip');
const tempfile = require('tempfile');
const { epubcheckVersion } = require('../package.json');

const URL = `https://github.com/IDPF/epubcheck/releases/download/v${epubcheckVersion}/epubcheck-${epubcheckVersion}.zip`;
const ZIP_FILE = tempfile('.zip');
const VENDORS_DIR = path.resolve(__dirname, '../vendors');

request({ url: URL, encoding: null })
    .pipe(fs.createWriteStream(ZIP_FILE))
    .on('close', () => {
        fs.createReadStream(ZIP_FILE)
            .pipe(unzip.Extract({ path: VENDORS_DIR }));
    });