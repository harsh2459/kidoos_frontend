const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '../public/images');
const webpDir = path.join(__dirname, '../public/images-webp');

// Get all image files recursively
function getAllImages(dir, baseDir = dir, files = []) {
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      getAllImages(fullPath, baseDir, files);
    } else if (/\.(png|jpg|jpeg|gif)$/i.test(item)) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      files.push(relativePath);
    }
  });

  return files;
}

// Get all WebP files
function getAllWebP(dir, baseDir = dir, files = new Set()) {
  if (!fs.existsSync(dir)) return files;

  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      getAllWebP(fullPath, baseDir, files);
    } else if (/\.webp$/i.test(item)) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      files.add(relativePath);
    }
  });

  return files;
}

const allImages = getAllImages(imagesDir);
const allWebP = getAllWebP(webpDir);

console.log('='.repeat(80));
console.log('Finding Images Missing WebP Versions');
console.log('='.repeat(80));
console.log(`\nTotal original images: ${allImages.length}`);
console.log(`Total WebP images: ${allWebP.size}\n`);

const missing = [];

allImages.forEach(imgPath => {
  const webpPath = imgPath.replace(/\.(png|jpg|jpeg|gif)$/i, '.webp');

  if (!allWebP.has(webpPath)) {
    const fullPath = path.join(imagesDir, imgPath);
    const stat = fs.statSync(fullPath);
    const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
    missing.push({ path: imgPath, size: sizeMB });
  }
});

console.log('❌ IMAGES MISSING WEBP VERSION:');
console.log('-'.repeat(80));

if (missing.length === 0) {
  console.log('  ✅ All images have WebP versions!');
} else {
  missing.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
  missing.forEach(({ path, size }) => {
    console.log(`  ${path.padEnd(60)} ${size} MB`);
  });
}

console.log('\n' + '='.repeat(80));
console.log(`SUMMARY: ${missing.length} images need WebP conversion`);
console.log('='.repeat(80) + '\n');

// Save list for conversion
if (missing.length > 0) {
  fs.writeFileSync(
    path.join(__dirname, 'missing-webp-list.json'),
    JSON.stringify(missing.map(m => m.path), null, 2)
  );
  console.log('📄 List saved to: scripts/missing-webp-list.json\n');
}
