const fs = require('fs');
const content = fs.readFileSync('/Users/aliou/Documents/swe-p/lib/osv-client.ts', 'utf8');

// on va copier le code de la fonction dans un script pour le tester
const script = content.substring(content.indexOf('function calculateCvssV3Score'), content.indexOf('async function fetchBatchWithRetry'));

fs.writeFileSync('test-parser.js', `
${script}

const vuln = {
  "id": "GHSA-36qx-fr4f-26g5",
  "database_specific": {
    "severity": "HIGH"
  },
  "severity": [
    {
      "type": "CVSS_V3",
      "score": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N"
    }
  ]
};

console.log(parseOSVVuln(vuln));
`);
