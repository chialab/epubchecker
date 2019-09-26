const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const tempfile = require('tempfile');
const { epubcheckVersion } = require('../package.json');

/**
 * The jar location of epubcheck.
 * @type {string}
 */
const JAR = path.resolve(__dirname, `../vendors/epubcheck-${epubcheckVersion}/epubcheck.jar`);

/**
 * Run epubcheck and return the report.
 *
 * @param {string} epubFile The absolute path ePub file
 * @param {Object} flags A set of flags for the checker.
 * @return {Promise<Object>} The epubcheck report
 */
function epubcheck(epubFile, flags = {}) {
    return new Promise((resolve, reject) => {
        // create a temporary file to store the java command output
        let output = tempfile('.json');
        let args = [];
        for (let flag in flags) {
            if (flags[flag] !== undefined) {
                args.push(`--${flag} ${JSON.stringify(flags[flag])}`);
            }
        }
        // build the command
        const command = `java -jar ${JAR} --json ${output} ${args.join(' ')} ${epubFile}`;
        try {
            // run the command
            exec(command, () => {
                // read output from the temporary file
                let json = fs.readFileSync(output, 'utf8');
                // and delete it
                fs.unlinkSync(output);
                // return the output
                resolve(JSON.parse(json));
            });
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = epubcheck;
