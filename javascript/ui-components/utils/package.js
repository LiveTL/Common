// create package.json

const fs = require('fs');
const replace = require('replace-in-file');

let defaultPackageJson = require('../package.json');

let ltlPackageJson = require('../submodules/LiveTL/package.json');
let deps = ltlPackageJson.dependencies;
Object.keys(deps).forEach(dep => {
  if (dep.includes('vue')) delete deps[dep];
});

const livetlManifest = JSON.parse(JSON.stringify(require("../submodules/LiveTL/src/manifest.json")));

const finalPackageJson = Object.assign(defaultPackageJson, {
  dependencies: deps
});
fs.writeFileSync('./build/package.json', JSON.stringify(
  finalPackageJson,
  '',
  2
), 'utf8');

fs.writeFileSync('./build/meta/package.json', JSON.stringify({
  description: ltlPackageJson.description,
  version: ltlPackageJson.version,
  ...livetlManifest
}));

const results = replace.sync({
  files: '../submodules/LiveTL/src/**',
  from: [
    /const isAndroid = false;/gi,
    /const MANIFEST_OBJECT = undefined;/gi
  ],
  to: [
    "const isAndroid = true;",
    `const MANIFEST_OBJECT = ${JSON.stringify(
        livetlManifest,
    )};`
  ]
});
