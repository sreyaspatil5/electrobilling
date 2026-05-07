const fs = require('fs');
const path = require('path');
const routesDir = path.join(__dirname, 'routes');
const files = fs.readdirSync(routesDir);
files.forEach(file => {
  if (file.endsWith('.js')) {
    const fp = path.join(routesDir, file);
    let content = fs.readFileSync(fp, 'utf8');
    content = content.replace(/const auth = require\('\.\.\/middleware\/auth'\);/g, "const { auth } = require('../middleware/auth');");
    fs.writeFileSync(fp, content);
  }
});
