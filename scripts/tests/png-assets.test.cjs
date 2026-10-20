const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Jimp = require('jimp-compact');
const root = path.resolve(__dirname, '../..');
function pngFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? pngFiles(file) : /\.png$/i.test(entry.name) ? [file] : [];
  });
}
for (const file of pngFiles(path.join(root, 'assets'))) {
  test('Expo puede leer PNG sin error CRC: ' + path.relative(root, file), async () => {
    const image = await Jimp.read(file);
    assert.ok(image.bitmap.width > 0 && image.bitmap.height > 0);
  });
}
