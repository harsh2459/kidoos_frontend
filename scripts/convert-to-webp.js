const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Priority images to convert first (critical for LCP)
const PRIORITY_IMAGES = [
  'Sacred_book_glowing.png',
  'vision-child-reading.png',
  'texture-pattern.png',
  'rays-golden.png',
  'Lotus_and_Diya_on_altar.png',
  'art-bg.png',
  'back-image.png',
  'foreground-cutout.png',
  '3d-english.png'
];

// Recursively find all image files
function findImages(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findImages(filePath, fileList);
    } else if (/\.(png|jpg|jpeg)$/i.test(file)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

async function convertToWebP() {
  console.log('🖼️  Converting images to WebP format...\n');

  const sourceDir = path.join(__dirname, '../public/images');
  const destDir = path.join(__dirname, '../public/images-webp');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log(`✅ Created output directory: ${destDir}\n`);
  }

  // Find all PNG and JPG images
  const files = findImages(sourceDir);

  console.log(`Found ${files.length} images to convert\n`);
  console.log('─'.repeat(80));

  let totalOriginalSize = 0;
  let totalWebpSize = 0;
  let priorityCount = 0;
  let convertedCount = 0;

  for (const file of files) {
    try {
      const fileName = path.basename(file);
      const relativePath = path.relative(sourceDir, file);
      const isPriority = PRIORITY_IMAGES.some(p =>
        fileName.toLowerCase().includes(p.toLowerCase().replace('.png', '').replace('.jpg', ''))
      );

      // Create corresponding directory structure in output
      const outputPath = path.join(destDir, relativePath).replace(/\.(png|jpg|jpeg)$/i, '.webp');
      const outputDir = path.dirname(outputPath);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Get original file size
      const originalStats = fs.statSync(file);
      const originalSize = originalStats.size / 1024 / 1024;
      totalOriginalSize += originalSize;

      // Convert to WebP
      await sharp(file)
        .webp({ quality: 85 })
        .toFile(outputPath);

      // Get WebP file size
      const webpStats = fs.statSync(outputPath);
      const webpSize = webpStats.size / 1024 / 1024;
      totalWebpSize += webpSize;

      const savings = ((1 - webpSize / originalSize) * 100).toFixed(1);

      if (isPriority) {
        priorityCount++;
        console.log(`🔴 ${fileName}`);
      } else {
        console.log(`   ${fileName}`);
      }
      console.log(`   Original: ${originalSize.toFixed(2)} MB → WebP: ${webpSize.toFixed(2)} MB (${savings}% smaller)\n`);

      convertedCount++;

    } catch (error) {
      console.error(`❌ Error converting ${path.basename(file)}:`, error.message);
    }
  }

  console.log('─'.repeat(80));
  console.log(`\n📈 Total Statistics:`);
  console.log(`   Total Images Converted: ${convertedCount}/${files.length}`);
  console.log(`   Priority Images (LCP): ${priorityCount}/${PRIORITY_IMAGES.length}`);
  console.log(`   Total Original Size: ${totalOriginalSize.toFixed(2)} MB`);
  console.log(`   Total WebP Size: ${totalWebpSize.toFixed(2)} MB`);
  console.log(`   Total Savings: ${((1 - totalWebpSize / totalOriginalSize) * 100).toFixed(1)}%`);
  console.log(`   Bytes Saved: ${(totalOriginalSize - totalWebpSize).toFixed(2)} MB\n`);

  console.log('✨ Next Steps:');
  console.log('   1. Run: node scripts/generate-responsive-images.js');
  console.log('   2. Update React components to use optimized images');
  console.log('   3. Test with: npm run build\n');
}

// Run the conversion
convertToWebP().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
