const fs = require('fs');
const path = require('path');
const util = require('util');
const stream = require('stream');
const fetch = require('node-fetch');
const Zip = require('adm-zip');
const tempfile = require('tempfile');
const streamPipeline = util.promisify(stream.pipeline);
const { epubcheckVersion } = require('../package.json');

const URL = `https://github.com/w3c/epubcheck/releases/download/v${epubcheckVersion}/epubcheck-${epubcheckVersion}.zip`;
const ZIP_FILE = tempfile('.zip');
const VENDORS_DIR = path.resolve(__dirname, '../vendors');

fetch(URL)
    .then((res) => streamPipeline(res.body, fs.createWriteStream(ZIP_FILE)))
    .then(() => {
        let zip = new Zip(ZIP_FILE);
        zip.extractAllTo(VENDORS_DIR);
    });
