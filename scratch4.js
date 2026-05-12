fetch('https://api.osv.dev/v1/querybatch', {
  method: 'POST',
  body: JSON.stringify({queries: [{ package: { name: 'lodash', ecosystem: 'npm' }, version: '4.17.11' }]})
})
.then(r => r.json())
.then(data => {
  console.log(JSON.stringify(data.results[0].vulns[0], null, 2));
})
.catch(console.error);
