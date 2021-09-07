// create package.json

const fs = require('fs');

let defaultPackageJson = require('../package.json');

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

fs.writeFileSync('./build/package-livetl.json', JSON.stringify({
  description: ltlPackageJson.description,
  version: ltlPackageJson.version,
  ...JSON.parse(JSON.stringify(require("../submodules/LiveTL/src/manifest.json")))
}));
