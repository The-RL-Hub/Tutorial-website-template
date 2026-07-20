const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function walk(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(directory, entry.name);
        return entry.isDirectory() ? walk(fullPath) : [fullPath];
    });
}

let checked = 0;
for (const htmlPath of walk(root).filter((file) => file.endsWith('.html'))) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const pattern = /<script(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi;
    for (const match of html.matchAll(pattern)) {
        if (!match[1].trim()) continue;
        new vm.Script(match[1], { filename: path.relative(root, htmlPath) });
        checked += 1;
    }
}

if (checked === 0) {
    throw new Error('No inline scripts were found to validate.');
}
console.log('PASS ' + checked + ' inline script syntax checks');
