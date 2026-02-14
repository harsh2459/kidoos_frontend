/**
 * Dynamic Sitemap Generator for Kiddos Intellect
 *
 * This script generates a sitemap.xml file with all static and dynamic pages
 * Run this script: node src/scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = 'https://www.kiddosintellect.com';
const API_URL = process.env.REACT_APP_API || 'http://localhost:5000';
const OUTPUT_PATH = path.join(__dirname, '../../public/sitemap.xml');

// Static pages with their priorities and change frequencies
const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/catalog', priority: '0.9', changefreq: 'daily' },
  { path: '/aboutus', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/faq', priority: '0.8', changefreq: 'monthly' },
  { path: '/preschool', priority: '0.8', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.4', changefreq: 'yearly' },
  { path: '/shipping', priority: '0.5', changefreq: 'monthly' },
  { path: '/refund', priority: '0.5', changefreq: 'monthly' },
  { path: '/terms', priority: '0.4', changefreq: 'yearly' },
];

// Generate XML URL entry
function generateUrlEntry(loc, lastmod = null, changefreq = 'monthly', priority = '0.5') {
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return `  <url>
    <loc>${loc}</loc>${lastmodTag}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

// Fetch books from backend
async function fetchBooks() {
  try {
    const fetch = require('node-fetch');
    const response = await fetch(`${API_URL}/books?visibility=public&limit=1000`);

    if (!response.ok) {
      console.warn('Warning: Could not fetch books from API. Generating sitemap with static pages only.');
      return [];
    }

    const data = await response.json();
    return data.books || [];
  } catch (error) {
    console.warn('Warning: Error fetching books:', error.message);
    console.warn('Generating sitemap with static pages only.');
    return [];
  }
}

// Fetch categories from backend
async function fetchCategories() {
  try {
    const fetch = require('node-fetch');
    const response = await fetch(`${API_URL}/categories`);

    if (!response.ok) {
      console.warn('Warning: Could not fetch categories from API.');
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.warn('Warning: Error fetching categories:', error.message);
    return [];
  }
}

// Generate sitemap
async function generateSitemap() {
  console.log('🗺️  Generating sitemap...');

  const currentDate = new Date().toISOString().split('T')[0];
  const urls = [];

  // Add static pages
  console.log('📄 Adding static pages...');
  staticPages.forEach(page => {
    urls.push(generateUrlEntry(
      `${SITE_URL}${page.path}`,
      currentDate,
      page.changefreq,
      page.priority
    ));
  });

  // Fetch and add dynamic book pages
  console.log('📚 Fetching books from API...');
  const books = await fetchBooks();

  if (books.length > 0) {
    console.log(`✅ Found ${books.length} books. Adding to sitemap...`);
    books.forEach(book => {
      if (book.slug) {
        const lastmod = book.updatedAt ? new Date(book.updatedAt).toISOString().split('T')[0] : currentDate;
        urls.push(generateUrlEntry(
          `${SITE_URL}/book/${book.slug}`,
          lastmod,
          'weekly',
          '0.8'
        ));
      }
    });
  }

  // Fetch and add category pages
  console.log('🏷️  Fetching categories from API...');
  const categories = await fetchCategories();

  if (categories.length > 0) {
    console.log(`✅ Found ${categories.length} categories. Adding to sitemap...`);
    categories.forEach(category => {
      if (category.slug) {
        urls.push(generateUrlEntry(
          `${SITE_URL}/catalog?category=${category.slug}`,
          currentDate,
          'weekly',
          '0.7'
        ));
      }
    });
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  // Write to file
  fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');
  console.log(`✅ Sitemap generated successfully!`);
  console.log(`📍 Location: ${OUTPUT_PATH}`);
  console.log(`📊 Total URLs: ${urls.length}`);
  console.log(`   - Static pages: ${staticPages.length}`);
  console.log(`   - Books: ${books.length}`);
  console.log(`   - Categories: ${categories.length}`);
}

// Run the generator
generateSitemap().catch(error => {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
});
