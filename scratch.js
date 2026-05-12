const fs = require('fs');
const deps = JSON.parse(fs.readFileSync('/Users/aliou/Downloads/package.json')).dependencies || {};
const queries = Object.keys(deps).map(name => ({ package: { name, ecosystem: 'npm' }, version: deps[name].replace(/[^0-9.]/g, '') }));
fetch('https://api.osv.dev/v1/querybatch', { method: 'POST', body: JSON.stringify({queries}) })
.then(r => r.json())
.then(data => {
  const vulns = data.results.filter(r => r.vulns).flatMap(r => r.vulns);
  console.log(JSON.stringify(vulns.slice(0, 2), null, 2));
})
.catch(console.error);
