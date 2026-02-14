const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Different sizes for responsive images
const SIZES = [400, 800, 1200, 1920]; // px widths

// Priority hero images that need responsive versions
const HERO_IMAGES = [
  'back-image.png',
  'foreground-cutout.png',
  'vision-child-reading.png',
  'Sacred_book_glowing.png',
  'art-bg.png',
  'Lotus_and_Diya_on_altar.png',
  'texture-pattern.png',
  'rays-golden.png'
];

async function generateResponsiveImages() {
  console.log('📐 Generating responsive image sizes...\n');

  const inputDir = path.join(__dirname, '../public/images');
  const outputDir = path.join(__dirname, '../public/images-optimized');

  // Create output directory if it doesn't exist
  try {
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`✅ Output directory ready: ${outputDir}\n`);
  } catch (err) {
    // Directory already exists
  }

  let totalGenerated = 0;
  let totalSize = 0;

  console.log('─'.repeat(80));

  for (const imageName of HERO_IMAGES) {
    const inputPath = path.join(inputDir, imageName);
    const baseName = path.parse(imageName).name;

    // Check if image exists
    try {
      await fs.access(inputPath);
    } catch (err) {
      console.log(`⚠️  Skipping ${imageName} (file not found)`);
      continue;
    }

    console.log(`\n🖼️  Processing: ${imageName}`);

    for (const width of SIZES) {
      const outputPath = path.join(outputDir, `${baseName}-${width}w.webp`);

      try {
        await sharp(inputPath)
          .resize(width, null, {
            withoutEnlargement: true,
            fit: 'inside'
          })
          .webp({ quality: 85 })
          .toFile(outputPath);

        const stats = await fs.stat(outputPath);
        const size = stats.size / 1024;
        totalSize += size;
        totalGenerated++;

        console.log(`   ✅ ${width}w: ${size.toFixed(0)} KB`);
      } catch (error) {
        console.error(`   ❌ Error generating ${width}w:`, error.message);
      }
    }
  }

  console.log('\n' + '─'.repeat(80));
  console.log(`\n📈 Generation Complete:`);
  console.log(`   Images Processed: ${HERO_IMAGES.length}`);
  console.log(`   Total Variants Generated: ${totalGenerated}`);
  console.log(`   Total Size: ${(totalSize / 1024).toFixed(2)} MB`);
  console.log(`   Average per variant: ${(totalSize / totalGenerated).toFixed(0)} KB\n`);

  console.log('✨ Next Steps:');
  console.log('   1. Create OptimizedImage component');
  console.log('   2. Update HeroVrindavan.jsx, VisionMissionValues.jsx, etc.');
  console.log('   3. Add preload hints to index.html\n');
}

// Run the generation
generateResponsiveImages().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
