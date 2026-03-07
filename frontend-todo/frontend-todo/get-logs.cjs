const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../backend-todo/logs');
if (fs.existsSync(logsDir)) {
  const files = fs.readdirSync(logsDir);
  for (const file of files) {
    if (file.endsWith('.log')) {
      const fullPath = path.join(logsDir, file);
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      console.log(`--- ${file} ---`);
      console.log(lines.slice(-50).join('\n'));
    }
  }
} else {
  console.log('Logs dir not found:', logsDir);
}
