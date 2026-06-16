import fs from 'fs';
import path from 'path';

const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAgAAAAIABAMAAAA+gXyHAAAAA1BMVEP/5ET23x+fAAAAP0lEQVR42u3BAQEAAACAkP6v7ggKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAK8G4MQAATj+w1cAAAAASUVORK5CYII=';

const iconsDir = path.join('public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const buffer = Buffer.from(base64Png, 'base64');
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), buffer);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), buffer);

console.log('PWA icons created successfully.');
