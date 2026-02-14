const fs = require('fs');
const path = require('path');

// Load the analysis report
const report = require('./webp-analysis-report.json');

// Create mapping of original paths to WebP paths
const imageMapping = {};
report.available.forEach(({ original, webp }) => {
  imageMapping[original] = `/images-webp/${webp}`;
});

console.log('='.repeat(80));
console.log('Updating Source Files to Use WebP Images');
console.log('='.repeat(80));
console.log(`\nTotal conversions to apply: ${Object.keys(imageMapping).length}\n`);

// Files to update (from grep results)
const filesToUpdate = [
  'src/pages/ContactUs.jsx',
  'src/pages/Vrindavan/WaterTransition.jsx',
  'src/pages/Checkout.jsx',
  'src/components/Footer.jsx',
  'src/pages/Vrindavan/UnderwaterVrindavan.jsx',
  'src/pages/Catalog.jsx',
  'src/components/FilterBar.jsx',
  'src/pages/Vrindavan/Portal.jsx',
  'src/pages/Cart.jsx',
  'src/pages/Terms&Conditions.jsx',
  'src/pages/BookDetail.jsx',
  'src/pages/ShippingPolicy.jsx',
  'src/components/Navbar.jsx',
  'src/pages/RefundPolicy.jsx',
  'src/pages/PrivacyPolicy.jsx',
  'src/pages/PreSchool.jsx',
  'src/pages/CustomerProfile.jsx',
  'src/pages/gita-deepseek/GitaShowcase.jsx',
  'src/pages/parallax/VisionMissionValues.jsx',
  'src/pages/CustomerAuth.jsx',
  'src/pages/AboutUs.jsx',
  'src/pages/Gita/GitaVideoSection.jsx',
  'src/pages/Gita/GitaHero.jsx',
  'src/pages/parallax/Section5.jsx',
  'src/pages/parallax/SacredFlowSection.jsx',
  'src/pages/Gita/GitaBentoGrid.jsx',
  'src/pages/parallax/HeroVrindavan.jsx',
  'src/pages/FAQ.jsx',
  'src/pages/Gita/GitaPricing.jsx',
  'src/pages/Invoice.jsx',
  'src/pages/Home.jsx',
  'src/pages/OrderHistory.jsx',
  'src/pages/parallax/BookShowcaseDark.jsx',
  'src/pages/gita_showcash/Section1.jsx',
];

let totalReplacements = 0;
const updatedFiles = [];

filesToUpdate.forEach(relativeFilePath => {
  const filePath = path.join(__dirname, '..', relativeFilePath);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping (file not found): ${relativeFilePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let replacementsInFile = 0;

  // Replace each image path
  Object.entries(imageMapping).forEach(([original, webp]) => {
    // Handle regular string references: "/images/file.png" or '/images/file.png'
    const regex1 = new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches1 = content.match(regex1);
    if (matches1) {
      content = content.replace(regex1, webp);
      replacementsInFile += matches1.length;
    }

    // Handle CSS url() references: url('/images/file.png') or url("/images/file.png")
    const originalEscaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex2 = new RegExp(`url\\(['"](${originalEscaped})['"\\)]`, 'g');
    const matches2 = content.match(regex2);
    if (matches2) {
      content = content.replace(regex2, `url('${webp}')`);
      replacementsInFile += matches2.length;
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${relativeFilePath} (${replacementsInFile} replacements)`);
    updatedFiles.push(relativeFilePath);
    totalReplacements += replacementsInFile;
  } else {
    console.log(`⏭️  No changes: ${relativeFilePath}`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('UPDATE SUMMARY:');
console.log('='.repeat(80));
console.log(`Files processed: ${filesToUpdate.length}`);
console.log(`Files updated: ${updatedFiles.length}`);
console.log(`Total image references replaced: ${totalReplacements}`);
console.log('='.repeat(80));

if (updatedFiles.length > 0) {
  console.log('\n📝 Updated files:');
  updatedFiles.forEach(file => console.log(`   - ${file}`));
}

console.log('\n✅ All available images have been updated to use WebP format!');
console.log('💡 Note: 17 images don\'t have WebP versions and were left unchanged.\n');
