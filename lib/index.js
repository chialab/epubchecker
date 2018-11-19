const fs = require('fs');
const epubcheck = require('./epubcheck');
const epubFromDirectory = require('./epubFromDirectory');

/**
 * @typedef {Object} EpubCheckerOptions
 * @property {boolean} includeWarnings Report should include warnings
 * @property {boolean} includeNotices Report should include notices
 * @property {string} output The path where to store the report
 * @property {RegExp|RegExp[]} ignore Regex for messages to ignore
 * @property {RegExp|RegExp[]} exclude Regex for files to exclude
 * @property {RegExp|RegExp[]} include Regex for files to include
 */

/**
 * Sort the report messages by severity.
 * @private
 *
 * @param {Object} report The epubchek report to sort
 * @return {Object} The sorted report
 */
function sortReport(report) {
    report.messages.sort((msg1, msg2) => {
        if (msg1.severity === msg2.severity) {
            return 0;
        }

        let severities = ['FATAL', 'ERROR', 'WARNING', 'INFO'];
        for (let i = 0; i < severities.length; i++) {
            let severity = severities[i];
            if (msg1.severity === severity) {
                return -1;
            }
            if (msg2.severity === severity) {
                return 1;
            }
        }
    });
    return report;
}

/**
 * Filter report by messages and files.
 *
 * @param {EpubCheckerOptions} options A set of filters options
 * @return {Object} The filtered report
 */
function filterReport(options = {}) {
    return function(report) {
        report.messages = report.messages.filter((msg) => {
            if (!options.includeWarnings && msg.severity === 'WARNING') {
                return false;
            }

            if (!options.includeNotices && msg.severity === 'INFO') {
                return false;
            }

            if (options.ignore) {
                let ignoreList = options.ignore;
                if (!Array.isArray(ignoreList)) {
                    ignoreList = [ignoreList];
                }

                if (ignoreList.some((regex) => regex.test(msg.message))) {
                    // remove ignored messages
                    return false;
                }
            }

            if (!options.exclude && !options.include) {
                return true;
            }

            if (!msg.locations || !msg.locations.length) {
                return true;
            }

            msg.locations = msg.locations.filter((location) => {
                if (options.include) {
                    let includeList = options.include;
                    if (!Array.isArray(includeList)) {
                        includeList = [includeList];
                    }
                    if (includeList.some((regex) => regex.test(location.path))) {
                        // keep included location
                        return true;
                    }
                }

                if (options.exclude) {
                    let excludeList = options.exclude;
                    if (!Array.isArray(excludeList)) {
                        excludeList = [excludeList];
                    }
                    if (!excludeList.some((regex) => regex.test(location.path))) {
                        // location is not excluded
                        return true;
                    }
                }

                // filter location
                return false;
            });

            if (msg.locations.length === 1 && msg.locations[0].path.includes('additional locations')) {
                // consider locations with only "additional" message as empty
                return false;
            }

            return !!msg.locations.length;
        });

        return report;
    }
}

/**
 * Run epubcheck over an ePub file (or an uncompressed ePub directory).
 *
 * @param {string} epubFile The ePub file or directory path
 * @param {EpubCheckerOptions} options A set of options for the checker
 * @param {Function} [callback] Optional callback for the checker
 * @return {Promise<Object>} The epubcheck report
 */
function epubchecker(epubFile, options = {}, callback = () => { }) {
    let epubTempFile = null;

    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    if (!fs.existsSync(epubFile)) {
        // cannot find epub file or directory
        return Promise.reject('missing file');
    }

    let tmpFilePromise = Promise.resolve(epubFile);
    if (fs.statSync(epubFile).isDirectory()) {
        // compress the directory as ePub
        tmpFilePromise = epubFromDirectory(epubFile)
            .then((file) => {
                epubTempFile = file;
                return file;
            });
    }

    // run epubcheck over the file and sort the report
    let resultPromise = tmpFilePromise
        .then(epubcheck)
        .then(filterReport(options))
        .then(sortReport);

    resultPromise.then((report) => {
        if (epubTempFile && fs.existsSync(epubTempFile)) {
            // remove temporary files
            fs.unlinkSync(epubTempFile);
        }

        if (options.output) {
            // store the output
            fs.writeFileSync(options.output, JSON.stringify(report, null, 2));
        }

        // exec callback with report
        callback(null, report);
    });

    resultPromise.catch((error) => {
        if (epubTempFile && fs.existsSync(epubTempFile)) {
            // remove temporary files
            fs.unlinkSync(epubTempFile);
        }
        // exec callback with report
        callback(error, null);
    });

    return resultPromise;
}

module.exports = epubchecker;