const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Replace import toast from 'react-hot-toast';
    if (content.includes("from 'react-hot-toast'") || content.includes('from "react-hot-toast"')) {
      content = content.replace(/import\s+toast\s+from\s+['"]react-hot-toast['"];?/g, "import { toast } from 'sonner';");
      content = content.replace(/import\s+{\s*toast\s*}\s+from\s+['"]react-hot-toast['"];?/g, "import { toast } from 'sonner';");
      content = content.replace(/import\s+toast,\s*{\s*Toaster\s*}\s+from\s+['"]react-hot-toast['"];?/g, "import { toast } from 'sonner';");
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated UI toasts for: ${filePath}`);
    }
  }
});
