#! /usr/bin/env node

require('colors');
const path = require('path');
const program = require('commander');
const { version } = require('../package.json');
const eslintchecker = require('../lib/index');

program
    .version(version, '-v, --version')
    .arguments('<file>')
    .option('-O, --output <path>', 'store json report')
    .option('--no-warnings', 'remove warnings from report')
    .option('--no-notices', 'remove notices from report')
    .option('--ignore <regex>', 'regex for messages to ignore', (ignore) => {
        program.ignoreList = program.ignoreList || [];
        program.ignoreList.push(ignore);
    })
    .option('--exclude <regex>', 'regex for files to exclude', (exclude) => {
        program.excludeList = program.excludeList || [];
        program.excludeList.push(exclude);
    })
    .option('--include <regex>', 'regex for files to include', (include) => {
        program.includeList = program.includeList || [];
        program.includeList.push(include);
    })
    .option('--silent', 'do not log errors')
    .action(async (file, options = {}) => {
        try {
            file = path.resolve(file);

            let json = await eslintchecker(file, {
                includeWarnings: !!options.warnings,
                includeNotices: !!options.notices,
                output: options.output && path.resolve(options.output),
                ignore: options.ignoreList && options.ignoreList.map(token => new RegExp(token)),
                exclude: options.excludeList && options.excludeList.map(token => new RegExp(token)),
                include: options.includeList && options.includeList.map(token => new RegExp(token)),
            });

            if (json.messages.length === 0) {
                if (!options.silent && !options.output) {
                    console.log('Everything is fine'.green);
                }
            } else {
                let errorsCount = 0;
                let warningsCount = 0;
                let noticesCount = 0;
                json.messages.forEach((msg) => {
                    let prefix = `${msg.severity}: `;
                    if (msg.severity === 'FATAL' || msg.severity === 'ERROR') {
                        prefix = `${msg.severity}: `.red;
                        errorsCount++;
                    } else if (msg.severity === 'WARNING') {
                        prefix = `${msg.severity}: `.yellow;
                        warningsCount++;
                    } else {
                        noticesCount++;
                    }
                    if (!options.silent && !options.output) {
                        console.log(`${prefix.toLowerCase()}[${msg.ID}] ${msg.message.replace(/\n/g, '\\n')}`);
                        if (msg.locations && msg.locations.length) {
                            msg.locations.forEach((location) => {
                                if (location.path.includes('additional locations')) {
                                    console.log(location.path);
                                    return;
                                }
                                if (location.line && location.column) {
                                    console.log(`${path.join(file, location.path)}${location.line >= 0 && location.column >= 0 ? `(${location.line},${location.column})` : ''}`);
                                }
                            });
                            console.log('');
                        }
                    }
                });
                if (!options.silent && !options.output) {
                    let messageChunk = [];
                    if (errorsCount) {
                        messageChunk.push(`${errorsCount} errors`.red);
                    }
                    if (warningsCount) {
                        messageChunk.push(`${warningsCount} warnings`.yellow);
                    }
                    if (noticesCount) {
                        messageChunk.push(`${noticesCount} notices`);
                    }

                    if (messageChunk.length) {
                        console.log(`\n${messageChunk.join('\n')}`)
                    }
                }
                if (errorsCount) {
                    process.exit(1);
                }
            }
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    })
    .parse(process.argv);
