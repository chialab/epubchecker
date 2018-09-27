# ePubChecker

Use [`epubcheck`](https://github.com/IDPF/epubcheck) by IDPF to get a validation report of an ePub.


[![npm](https://img.shields.io/npm/v/epubchecker.svg?style=flat-square)](https://www.npmjs.com/package/epubchecker)

## Usage

### Node API

Install the package:
```sh
npm install epubchecker
```

Require and use:
```js
const epubchecker = require('epubchecker');

const report = await epubchecker('public/the-little-prince.epub', {
    includeWarnings: true,
    // do not check CSS and font files
    exclude: /\.(css|ttf|opf|woff|woff2)$/,
});
```

#### Options

Here is a complete list of `epubchecker` options:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| includeWarnings | `boolean` | `false` | Report should include warnings.     |
| includeNotices  | `boolean` | `false` | Report should include notices.      |
| output          | `string`  | `null`  | The path where to store the report. |
| ignore          | `RegExp`  | `null`  | Regex for messages to ignore.       |
| exclude         | `RegExp`  | `null`  | Regex for files to exclude.         |
| include         | `RegExp`  | `null`  | Regex for files to include.         |


### CLI

Install the CLI globally:
```sh
npm install epubchecker -g
```

Use the `epubchecker` in your terminal:
```
$ epubchecker --help
Usage: epubchecker [options] <file>

Options:

  -v, --version        output the version number
  -O, --output <path>  store json report
  --no-warnings        remove warnings from report
  --no-notices         remove notices from report
  --ignore <regex>     regex for messages to ignore
  --exclude <regex>    regex for files to exclude
  --include <regex>    regex for files to include
  --silent             do not log errors
  -h, --help           output usage information
```