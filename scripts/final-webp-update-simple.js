const fs = require('fs');
const path = require('path');

const webpDir = path.join(__dirname, '../public/images-webp');

// Get all WebP files available
function getAllWebP() {
  const webpFiles = new Set();

  function scan(dir, baseDir = dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scan(fullPath, baseDir);
      } else if (file.endsWith('.webp')) {
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        // Remove .webp extension to get base name
        const baseName = relativePath.replace(/\.webp$/, '');
        webpFiles.add(baseName);
      }
    });
  }

  scan(webpDir);
  return webpFiles;
}

// Get all JSX/JS files
function getAllJSFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      getAllJSFiles(fullPath, files);
    } else if (/\.(js|jsx)$/i.test(item)) {
      files.push(fullPath);
    }
  });

  return files;
}

const availableWebP = getAllWebP();

console.log('='.repeat(80));
console.log('Final WebP Migration - Complete Update');
console.log('='.repeat(80));
console.log(`\nWebP files available: ${availableWebP.size}\n`);

// Find all JSX files
const srcDir = path.join(__dirname, '../src');
const jsxFiles = getAllJSFiles(srcDir);

let totalUpdates = 0;
let filesUpdated = 0;
const brokenReferences = new Set();

jsxFiles.forEach(filePath => {
  const relativePath = path.relative(srcDir, filePath).replace(/\\/g, '/');
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let updates = 0;

  // Find all /images/ references
  const imageRegex = /(['"`])(\/images\/[^'"`]+\.(png|jpg|jpeg|gif))\1/gi;
  const urlRegex = /url\((['"`])(\/images\/[^'"`]+\.(png|jpg|jpeg|gif))\1\)/gi;

  // Replace direct image references
  content = content.replace(imageRegex, (match, quote, imagePath, ext) => {
    const pathWithoutPrefix = imagePath.replace(/^\/images\//, '');
    const baseName = pathWithoutPrefix.replace(/\.(png|jpg|jpeg|gif)$/i, '');

    if (availableWebP.has(baseName)) {
      updates++;
      return `${quote}/images-webp/${baseName}.webp${quote}`;
    } else {
      brokenReferences.add(imagePath);
      return match;
    }
  });

  // Replace CSS url() references
  content = content.replace(urlRegex, (match, quote, imagePath, ext) => {
    const pathWithoutPrefix = imagePath.replace(/^\/images\//, '');
    const baseName = pathWithoutPrefix.replace(/\.(png|jpg|jpeg|gif)$/i, '');

    if (availableWebP.has(baseName)) {
      updates++;
      return `url('/images-webp/${baseName}.webp')`;
    } else {
      brokenReferences.add(imagePath);
      return match;
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${relativePath} (${updates} updates)`);
    filesUpdated++;
    totalUpdates += updates;
  }
});

console.log('\n' + '='.repeat(80));
console.log('UPDATE SUMMARY:');
console.log('='.repeat(80));
console.log(`Files scanned: ${jsxFiles.length}`);
console.log(`Files updated: ${filesUpdated}`);
console.log(`Total references updated: ${totalUpdates}`);
console.log(`Broken references found: ${brokenReferences.size}`);
console.log('='.repeat(80));

if (brokenReferences.size > 0) {
  console.log('\n⚠️  BROKEN REFERENCES (files don\'t exist):');
  console.log('-'.repeat(80));
  Array.from(brokenReferences).sort().forEach(ref => {
    console.log(`  ${ref}`);
  });

  fs.writeFileSync(
    path.join(__dirname, 'broken-references.json'),
    JSON.stringify(Array.from(brokenReferences), null, 2)
  );
  console.log('\n📄 Broken references saved to: scripts/broken-references.json');
}

console.log('\n✅ Final WebP migration complete!\n');
