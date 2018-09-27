const fs = require('fs');
const path = require('path');
const tempfile = require('tempfile');
const archiver = require('archiver');

/**
 * Archive a directory using the ePub extension.
 *
 * @param {string} epubRoot The absolute path of the directory to archive
 * @return {Promise<string>} The temporary path of archive
 */
function epubFromDirectory(epubRoot) {
    return new Promise((resolve, reject) => {
        // create the tempfile
        let tmpFile = tempfile('.epub');
        // open the output stream
        let output = fs.createWriteStream(tmpFile);
        // create the archive
        let archive = archiver('zip');

        archive.on('error', (error) => {
            reject(error);
        });

        output.on('close', () => {
            resolve(tmpFile);
        });

        // stream the archive to the output file
        archive.pipe(output);

        // get directory children
        let files = fs.readdirSync(epubRoot);
        files.forEach((file) => {
            let fullFile = path.join(epubRoot, file);
            if (file === 'mimetype') {
                // archive the mimetype file without compression
                archive.file(fullFile, {
                    name: file,
                    store: true,
                });
            } else if (fs.statSync(fullFile).isDirectory()) {
                // archive a directory with the content
                archive.directory(fullFile, file);
            } else {
                // archive a file
                archive.file(fullFile, {
                    name: file,
                });
            }
        });

        // close the archive
        archive.finalize();
    });
}

module.exports = epubFromDirectory;