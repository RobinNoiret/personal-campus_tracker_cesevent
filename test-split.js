const fs = require('fs');
const sql = fs.readFileSync('lib/db/schema.sql', 'utf-8');
const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));
console.log('Total statements:', statements.length);
statements.forEach((s, i) => {
  const preview = s.substring(0, 100).replace(/\s+/g, ' ');
  console.log(`[${i+1}]`, preview + '...');
});
