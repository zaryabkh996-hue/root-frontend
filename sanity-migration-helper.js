const fs = require('fs');
const path = require('path');

// Helper to parse .env.local manually
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found in the current directory!');
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = match[2] || '';
      if (val.length > 0 && val.charAt(0) === '"' && val.charAt(val.length - 1) === '"') {
        val = val.substring(1, val.length - 1);
      }
      env[match[1]] = val.trim();
    }
  });
  return env;
}

const env = loadEnv();
const PROJECT_ID = env.SANITY_PROJECT_ID;
const DATASET = env.SANITY_DATASET || 'production';
const API_VERSION = env.SANITY_API_VERSION || '2026-05-22';
const TOKEN = env.SANITY_TOKEN;

if (!PROJECT_ID || !TOKEN) {
  console.error('Error: SANITY_PROJECT_ID and SANITY_TOKEN must be set in .env.local!');
  process.exit(1);
}

const command = process.argv[2];

if (command === 'backup') {
  console.log(`Starting backup from Sanity project ${PROJECT_ID}...`);
  const query = encodeURIComponent('*[_type == "module"]');
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${query}`;
  
  fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  })
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return res.json();
  })
  .then(data => {
    const modules = data.result || [];
    console.log(`Successfully fetched ${modules.length} modules.`);
    fs.writeFileSync(path.join(__dirname, 'sanity_modules_backup.json'), JSON.stringify(modules, null, 2));
    console.log('Saved backup to sanity_modules_backup.json');
  })
  .catch(err => {
    console.error('Backup failed:', err.message);
  });
} else if (command === 'restore') {
  const backupPath = path.join(__dirname, 'sanity_modules_backup.json');
  if (!fs.existsSync(backupPath)) {
    console.error('Error: sanity_modules_backup.json not found! Run backup command first.');
    process.exit(1);
  }
  const modules = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  console.log(`Starting restore of ${modules.length} modules to Sanity project ${PROJECT_ID}...`);

  const mutations = modules.map(doc => ({
    createOrReplace: doc
  }));

  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}?returnDocuments=false`;
  
  fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ mutations })
  })
  .then(res => {
    return res.json().then(data => {
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${JSON.stringify(data)}`);
      }
      return data;
    });
  })
  .then(data => {
    console.log('Successfully restored all modules to the new Sanity project!');
  })
  .catch(err => {
    console.error('Restore failed:', err.message);
  });
} else {
  console.log('Usage:');
  console.log('  node sanity-migration-helper.js backup    - Exports modules from the current Sanity project');
  console.log('  node sanity-migration-helper.js restore   - Imports saved modules into the current Sanity project');
}
