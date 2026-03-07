const { execSync } = require('child_process');
const fs = require('fs');
try {
  execSync('..\\\\..\\\\backend-todo\\\\mvnw.cmd compile -q', { 
    cwd: '..\\\\..\\\\backend-todo',
    encoding: 'utf-8' 
  });
} catch (e) {
  fs.writeFileSync('..\\\\..\\\\backend-todo\\\\compile_errors.txt', e.stdout + "\\n" + e.stderr);
}
