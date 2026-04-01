const fs = require('fs');
let code = fs.readFileSync('src/components/settings/GeneralSettings.tsx', 'utf8');

code = code.replace(/text-white\/([0-9]+)/g, 'text-foreground/$1');
code = code.replace(/ bg-white\/([0-9]+)/g, ' bg-foreground/$1');
code = code.replace(/border-white\/([0-9]+)/g, 'border-foreground/$1');
code = code.replace(/ text-white\b/g, ' text-foreground');
code = code.replace(/"text-white\b/g, '"text-foreground');
code = code.replace(/bg-white\/\[([^\]]+)\]/g, 'bg-foreground/[$1]');

fs.writeFileSync('src/components/settings/GeneralSettings.tsx', code);
console.log('Done!');
