import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Component - Dynamic Meta Tags and Structured Data
 *
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Meta description (150-160 chars)
 * @param {string} props.image - Open Graph image URL
 * @param {string} props.url - Canonical URL
 * @param {string} props.type - Open Graph type (website, product, article)
 * @param {Object} props.product - Product schema data (for e-commerce)
 * @param {Object} props.structuredData - Additional JSON-LD structured data
 * @param {Array} props.breadcrumbs - Breadcrumb items [{name, url}]
 * @param {Object} props.faq - FAQ schema data {questions: [{question, answer}]}
 * @param {boolean} props.noindex - Prevent search engine indexing
 * @param {string} props.keywords - Additional keywords for this page
 */
export default function SEO({
  title = "Kiddos Intellect - Premium Children's Books",
  description = "Discover hand-picked children's books and educational materials. Healthy Minds Grow Beyond Screens. Shop premium learning resources for curious young minds.",
  image = "/favicon.jpg",
  url,
  type = "website",
  product,
  structuredData,
  breadcrumbs,
  faq,
  noindex = false,
  keywords = "",
}) {
  // Get full URL
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.kiddosintellect.com';
  const fullUrl = url || (typeof window !== 'undefined' ? window.location.href : siteUrl);
  const fullImageUrl = image?.startsWith('http') ? image : `${siteUrl}${image}`;

  // Build full title
  const fullTitle = title.includes('Kiddos Intellect') ? title : `${title} | Kiddos Intellect`;

  // Organization structured data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Kiddos Intellect",
    "url": siteUrl,
    "logo": `${siteUrl}/favicon.jpg`,
    "description": "Premium children's books and educational materials provider",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "kiddosintellect@gmail.com",
      "telephone": "+91-98798-57529",
      "availableLanguage": "English"
    },
    "sameAs": [
      "https://www.instagram.com/kiddosintellect/",
      "https://www.threads.com/@kiddosintellect"
    ]
  };

  // WebSite schema with search action
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Kiddos Intellect",
    "url": siteUrl,
    "description": "Premium children's books and educational materials",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/catalog?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  // LocalBusiness schema for local SEO
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Kiddos Intellect",
    "image": `${siteUrl}/favicon.jpg`,
    "url": siteUrl,
    "telephone": "+91-98798-57529",
    "email": "kiddosintellect@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "206, Sunrise Commercial Complex, Near Savaji Korat Brg, Lajamani chowk, Shanti Niketan Society, Mota Varachha",
      "addressLocality": "Surat",
      "addressRegion": "Gujarat",
      "postalCode": "394101",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "addressCountry": "IN"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    },
    "priceRange": "₹₹"
  };

  // Breadcrumb schema
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url?.startsWith('http') ? crumb.url : `${siteUrl}${crumb.url}`
    }))
  } : null;

  // FAQ schema
  const faqSchema = faq && faq.questions && faq.questions.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.questions.map(q => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    }))
  } : null;

  // Product structured data
  const productSchema = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image || fullImageUrl,
    "description": product.description || description,
    "sku": product.sku || product.id,
    "offers": {
      "@type": "Offer",
      "url": fullUrl,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": product.priceValidUntil,
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Kiddos Intellect"
      }
    },
    ...(product.rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating.value,
        "reviewCount": product.rating.count
      }
    })
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Kiddos Intellect" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* Structured Data - WebSite (for homepage) */}
      {type === 'website' && !product && (
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
      )}

      {/* Structured Data - Organization */}
      {!product && (
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      )}

      {/* Structured Data - LocalBusiness (for homepage) */}
      {type === 'website' && !product && (
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
      )}

      {/* Structured Data - Breadcrumb */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {/* Structured Data - Product */}
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}

      {/* Structured Data - FAQ */}
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}

      {/* Additional Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
