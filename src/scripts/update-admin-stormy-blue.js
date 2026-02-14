/**
 * Admin Theme Color Update Script - Stormy Morning Blue
 * Run: node src/scripts/update-admin-stormy-blue.js
 */

const fs = require('fs');
const path = require('path');

// Stormy Morning Blue palette
const colorReplacements = [
    { from: /#222831/gi, to: '#384959' },  // Dark charcoal → Dark slate
    { from: /#393E46/gi, to: '#6A89A7' },        // Dark gray → Steel blue
    { from: /#00ADB5/gi, to: '#88BDF2' },  // Cyan → Sky blue
    { from: /bg-cyan-100/g, to: 'bg-blue-100' },
    { from: /text-cyan-700/g, to: 'text-blue-700' },
    { from: /border-cyan-200/g, to: 'border-blue-200' },
    { from: /from-cyan-/g, to: 'from-blue-' },
    { from: /to-cyan-/g, to: 'to-blue-' },
    { from: /hover:bg-cyan-/g, to: 'hover:bg-blue-' },
    { from: /hover:text-cyan-/g, to: 'hover:text-blue-' },
    { from: /hover:border-cyan-/g, to: 'hover:border-blue-' },
];

const adminFiles = [
    'src/pages/Admin/Books.jsx',
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
        console.log(`➖ No changes: ${filePath}`);
        return false;
    }
}

console.log('🎨 Applying Stormy Morning Blue Theme...\n');
let updated = 0;

adminFiles.forEach(file => {
    if (updateFile(file)) {
        updated++;
    }
});

console.log(`\n✨ Complete! Updated ${updated}/${adminFiles.length} files`);
