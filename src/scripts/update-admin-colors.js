/**
 * Admin Theme Color Update Script
 * Applies Stormy Morning blue theme to all admin files
 * 
 * Color Mapping:
 * #222831 → #384959 (dark charcoal to dark slate)
 * #393E46 → #6A89A7 (dark gray to steel blue)
 * #00ADB5 → #88BDF2 (cyan to sky blue)
 * #EEEEEE → #BDDDFC (light gray to ice blue)
 */

const fs = require('fs');
const path = require('path');

const colorReplacements = [
    { from: /#222831/g, to: '#384959' },
    { from: /#393E46/g, to: '#6A89A7' },
    { from: /#00ADB5/g, to: '#88BDF2' },
    { from: /#EEEEEE/g, to: '#BDDDFC' },
    { from: /cyan-(\d+)/g, to: 'blue-$1' },
];

const adminFiles = [
    'src/pages/Admin/AddBook.jsx',
    'src/pages/Admin/EditBook.jsx',
    'src/pages/Admin/Orders.jsx',
    'src/pages/Admin/Payments.jsx',
    'src/pages/Admin/Categories.jsx',
    'src/pages/Admin/Homepage.jsx',
    'src/pages/Admin/SiteSettings.jsx',
    'src/pages/Admin/CatalogSettings.jsx',
    'src/pages/Admin/PopupSettings.jsx',
    'src/pages/Admin/AiSettings.jsx',
    'src/pages/Admin/EmailTemplates.jsx',
    'src/pages/Admin/EmailSenders.jsx',
    'src/pages/Admin/ApiUsers.jsx',
    'src/pages/Admin/ShiprocketPanel.jsx',
    'src/pages/Admin/Setup.jsx',
    'src/pages/Admin/Visibility.jsx',
    'src/components/AdminLayout.jsx',
    'src/components/AdminSidebar.jsx',
    'src/components/AdminTabs.jsx',
];

function updateFile(filePath) {
    const fullPath = path.join(__dirname, '..', '..', filePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    colorReplacements.forEach(({ from, to }) => {
        if (content.match(from)) {
            content = content.replace(from, to);
            modified = true;
        }
    });

    if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
        return true;
    } else {
        console.log(`➖ No changes needed: ${filePath}`);
        return false;
    }
}

console.log('🎨 Starting Admin Theme Update...\n');
let updated = 0;

adminFiles.forEach(file => {
    if (updateFile(file)) {
        updated++;
    }
});

console.log(`\n✨ Complete! Updated ${updated}/${adminFiles.length} files`);
