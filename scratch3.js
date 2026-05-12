const fs = require('fs');
const deps = JSON.parse(fs.readFileSync('/Users/aliou/Downloads/package.json')).dependencies || {};
const queries = Object.keys(deps).map(name => ({ package: { name, ecosystem: 'npm' }, version: deps[name].replace(/[^0-9.]/g, '') }));

console.log(JSON.stringify({queries}, null, 2));

fetch('https://api.osv.dev/v1/querybatch', { method: 'POST', body: JSON.stringify({queries}) })
.then(r => r.json())
.then(data => {
  console.log(JSON.stringify(data.results.map((r, i) => ({
    name: queries[i].package.name,
    vulnCount: r.vulns ? r.vulns.length : 0
  })), null, 2));
})
.catch(console.error);
