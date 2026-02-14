const fs = require('fs');
const path = require('path');

// Get all WebP files available
const webpDir = path.join(__dirname, '../public/images-webp');
const webpFiles = new Set();

function scanWebPFolder(dir, baseDir = dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanWebPFolder(fullPath, baseDir);
    } else if (file.endsWith('.webp')) {
      // Store relative path from images-webp folder
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      webpFiles.add(relativePath);
    }
  });
}

scanWebPFolder(webpDir);

// Common images used in the codebase (from grep results)
const imageReferences = [
  '/images/contact/contant_bg.png',
  '/images/flower_contant.png',
  '/images/image_59eec6.jpg',
  '/images/homepage/parchment-bg.png',
  '/images/homepage/mandala-bg.png',
  '/images/homepage/footer-vrindavan-bg.png',
  '/images/homepage/parchment-noise.png',
  '/images/vrundaven/image_ffc064.png',
  '/images/catalog-banner.jpg',
  '/images/grape-vine.png',
  '/images/golden-plant.png',
  '/images/vrundaven/blue_orb.png',
  '/images/vrundaven/fire_orb.png',
  '/images/vrundaven/green_orb.png',
  '/images/vrundaven/yellow_orb.png',
  '/images/terms-decree-bg.png',
  '/images/shipping-map-bg.png',
  '/images/refund-scales-bg.png',
  '/images/privacy-scroll-bg.png',
  '/images/pre_school/cat-mythology.png',
  '/images/pre_school/cat-religious.png',
  '/images/pre_school/cat-moral.png',
  '/images/pre_school/cat-activity.png',
  '/images/pre_school/cat-knowledge.png',
  '/images/pre_school/cat-bilingual.png',
  '/images/pre_school/preschool-hero-bg.png',
  '/images/pre_school/mandala-bg.png',
  '/images/pre_school/cosmic-wisdom-bg.png',
  '/images/pre_school/benefits-cows-bg.png',
  '/images/pre_school/testimonials-flowers-bg.png',
  '/images/HindiGita3D.png',
  '/images/EnglishGita3D.png',
  '/images/GujratiGita3D.png',
  '/images/vision-background.png',
  '/images/vrindavan-layer-3.png',
  '/images/image_4.png',
  '/images/vision-child-reading.png',
  '/images/Sacred_book_glowing.png',
  '/images/Lotus_and_Diya_on_altar.png',
  '/images/auth-spiritual-bg.png',
  '/images/about/ancient-scripture-bg.png',
  '/images/about/sacred-garden-pattern.png',
  '/images/About-us.png',
  '/images/gita-english/Bento_grid_right.jpg',
  '/images/gita-english-hero.png',
  '/images/gita-inside-english-1.jpg',
  '/images/gita-inside-english-2.jpg',
  '/images/gita-inside-english-3.jpg',
  '/images/gita-inside-english-4.jpg',
  '/images/gita-inside-english-5.jpg',
  '/images/gita-inside-english-6.jpg',
  '/images/gita-inside-english-7.jpg',
  '/images/gita-inside-english-8.jpg',
  '/images/gita-inside-english-9.jpg',
  '/images/gita-inside-english-10.jpg',
  '/images/1.jpg',
  '/images/illustration-water-ripple.png',
  '/images/texture-parchment-wash.png',
  '/images/Dark_background.png',
  '/images/back-image.png',
  '/images/foreground-cutout.png',
  '/images/faq-library-bg.png',
  '/images/logo.jpg',
  '/images/homepage/hero-banner.jpg',
  '/images/3d-english.png',
  '/images/3d_hindi.png',
  '/images/3d_gujarati.png',
  '/images/art-bg.png',
  '/images/gita_showcash.png',
];

console.log('='.repeat(80));
console.log('WebP Conversion Analysis');
console.log('='.repeat(80));
console.log(`\nTotal WebP files available: ${webpFiles.size}`);
console.log(`Total image references found: ${imageReferences.length}\n`);

const available = [];
const missing = [];

imageReferences.forEach(imgPath => {
  // Convert /images/path/file.png to path/file.webp
  const withoutPrefix = imgPath.replace(/^\/images\//, '');
  const webpPath = withoutPrefix.replace(/\.(png|jpg|jpeg|gif)$/i, '.webp');

  if (webpFiles.has(webpPath)) {
    available.push({ original: imgPath, webp: webpPath });
  } else {
    missing.push(imgPath);
  }
});

console.log('✅ AVAILABLE IN WEBP FORMAT:');
console.log('-'.repeat(80));
available.forEach(({ original, webp }) => {
  console.log(`  ${original} → /images-webp/${webp}`);
});

console.log(`\n❌ NOT AVAILABLE IN WEBP FORMAT:`);
console.log('-'.repeat(80));
missing.forEach(img => {
  console.log(`  ${img}`);
});

console.log('\n' + '='.repeat(80));
console.log(`SUMMARY:`);
console.log(`  ✅ Can convert to WebP: ${available.length}/${imageReferences.length} (${Math.round(available.length/imageReferences.length*100)}%)`);
console.log(`  ❌ Missing WebP version: ${missing.length}/${imageReferences.length}`);
console.log('='.repeat(80));

// Save detailed report
const report = {
  totalWebPFiles: webpFiles.size,
  totalReferences: imageReferences.length,
  availableCount: available.length,
  missingCount: missing.length,
  available,
  missing,
  conversionRate: Math.round(available.length/imageReferences.length*100)
};

fs.writeFileSync(
  path.join(__dirname, 'webp-analysis-report.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n📄 Detailed report saved to: scripts/webp-analysis-report.json\n');
