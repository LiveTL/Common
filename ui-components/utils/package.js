// create package.json

const fs = require('fs');

let defaultPackageJson = {
  "name": "@livetl/ui-components",
  "version": "0.0.1",
  "description": "LiveTL's UI components",
  "license": "AGPL-3.0",
  "author": "LiveTL Developers",
  "repository": {
    "type": "git",
    "url": "https://github.com/LiveTL/Common.git",
    "directory": "javascript/ui-components"
  },
  "bugs": {
    "url": "https://github.com/LiveTL/Common/issues"
  },
  "homepage": "https://github.com/LiveTL/Common#readme",
  "funding": {
    "url": "https://opencollective.com/livetl"
  }
};

let ltlPackageJson = require('../submodules/LiveTL/package.json');
let deps = ltlPackageJson.dependencies;
Object.keys(deps).forEach(dep => {
  if (dep.includes('vue')) delete deps[dep];
});

const finalPackageJson = Object.assign(defaultPackageJson, {
  dependencies: deps
});
fs.writeFileSync('./build/package.json', JSON.stringify(
  finalPackageJson,
  '',
  2
), 'utf8');

