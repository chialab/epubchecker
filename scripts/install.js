const fs = require('fs');
const path = require('path');
const request = require('request');
const Zip = require('adm-zip');
const tempfile = require('tempfile');
const { epubcheckVersion } = require('../package.json');

const URL = `https://github.com/w3c/epubcheck/releases/download/v${epubcheckVersion}/epubcheck-${epubcheckVersion}.zip`;
const ZIP_FILE = tempfile('.zip');
const VENDORS_DIR = path.resolve(__dirname, '../vendors');

request({ url: URL, encoding: null })
    .pipe(fs.createWriteStream(ZIP_FILE))
    .on('close', () => {
        let zip = new Zip(ZIP_FILE);
        zip.extractAllTo(VENDORS_DIR);
    });
