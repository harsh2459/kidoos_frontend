# Kiddos Intellect — Frontend

The official storefront and admin panel for **[kiddosintellect.com](https://kiddosintellect.com)** — a full-featured e-commerce platform for children's books and educational materials.

Built with **React 19**, **Tailwind CSS v3**, **Zustand**, and deployed on **Vercel**.

---

## Table of Contents

- [Live URLs](#live-urls)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Pages & Routes](#pages--routes)
  - [Customer Pages](#customer-pages)
  - [Admin Pages](#admin-pages)
- [State Management & Contexts](#state-management--contexts)
- [Custom Hooks](#custom-hooks)
- [API Layer](#api-layer)
- [Components](#components)
- [Styling & Theming](#styling--theming)
- [External Integrations](#external-integrations)
- [Performance & Architecture](#performance--architecture)
- [Deployment](#deployment)

---

## Live URLs

| Environment | URL |
|---|---|
| Production | https://kiddosintellect.com |
| Vercel Deployment | https://kiddos-frontend.vercel.app |
| Backend API | https://kiddosintellect.com/api |

---

## Tech Stack

| Category | Library / Tool |
|---|---|
| UI Framework | React 19 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v3, Styled Components |
| State Management | Zustand (cart), React Context (auth, config) |
| Animation | GSAP v3, Framer Motion v12, Lenis (smooth scroll) |
| 3D | React Three Fiber, Three.js |
| HTTP Client | Axios |
| Authentication | Firebase (Google OAuth, anonymous) + custom JWT |
| Charts | Recharts |
| Icons | Lucide React, React Icons |
| SEO | react-helmet-async |
| Payments | Razorpay (dynamic SDK) |
| PDF/Invoice | file-saver |
| Notifications | react-toastify |
| Book Preview | react-pageflip |
| Build Tool | Create React App (react-scripts 5) |
| Deployment | Vercel |

---

## Project Structure

```
frontend/
├── public/                   # Static assets, index.html
├── src/
│   ├── api/                  # All Axios API call modules
│   │   ├── client.jsx        # Central Axios instance with interceptors
│   │   ├── customer.jsx      # Customer auth & cart API
│   │   ├── asset.jsx         # Asset URL helpers (R2/CDN)
│   │   ├── categories.jsx    # Category CRUD
│   │   ├── bluedart.jsx      # BlueDart shipping API
│   │   ├── shiprocket.jsx    # Shiprocket shipping API
│   │   └── emails.jsx        # Email template & sender API
│   ├── components/           # Shared/reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── FilterBar.jsx
│   │   ├── DynamicPopup.jsx
│   │   ├── SEO.jsx
│   │   ├── RouteGuard.jsx
│   │   ├── AdminLayout.jsx
│   │   ├── AdminSidebar.jsx
│   │   ├── AdminTabs.jsx
│   │   ├── LoadingFallback.jsx
│   │   ├── OptimizedImage.jsx
│   │   ├── ProgressivePuzzleGame.jsx
│   │   ├── ScrollToTopButton.jsx
│   │   ├── WaveText.jsx
│   │   ├── WhatsAppButton.jsx
│   │   ├── button/           # Button variants
│   │   └── toasts/           # Custom toast components
│   ├── contexts/             # React Context providers
│   │   ├── Auth.jsx          # Admin JWT auth
│   │   ├── CustomerAuth.jsx  # Customer auth + cart hydration
│   │   ├── CartStore.jsx     # Zustand cart store
│   │   ├── SiteConfig.jsx    # Site settings + visibility config
│   │   └── ThemeContext.jsx  # CSS variable theme tokens
│   ├── hooks/                # Custom React hooks
│   │   ├── useCartCleanup.js # Auto-clean invalid cart items
│   │   └── useInView.js      # IntersectionObserver lazy loader
│   ├── lib/                  # Pure utility helpers
│   │   ├── Price.js          # Price/discount calculator
│   │   ├── toast.js          # Typed toast notification helpers
│   │   └── firebase.js       # Firebase lazy initializer
│   ├── pages/                # Route-level page components
│   │   ├── Home.jsx
│   │   ├── Catalog.jsx
│   │   ├── BookDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── CustomerAuth.jsx
│   │   ├── CustomerProfile.jsx
│   │   ├── OrderHistory.jsx
│   │   ├── Invoice.jsx
│   │   ├── AboutUs.jsx
│   │   ├── PreSchool.jsx
│   │   ├── FAQ.jsx
│   │   ├── ContactUs.jsx
│   │   ├── PrivacyPolicy.jsx
│   │   ├── ShippingPolicy.jsx
│   │   ├── Terms&Conditions.jsx
│   │   ├── RefundPolicy.jsx
│   │   ├── parallax/         # Parallax/hero sections
│   │   └── Admin/            # All admin panel pages (see below)
│   ├── scripts/              # Build-time scripts
│   │   └── generate-sitemap.js  # Auto sitemap generation (prebuild)
│   ├── styles/               # Global CSS files
│   │   ├── classic-light.css
│   │   └── DynamicPopup.css
│   ├── App.js                # Root component, providers, routing
│   └── index.js              # React 18 root mount
├── tailwind.config.js
├── postcss.config.js
└── vercel.json
```

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env
# Fill in values (see below)

# 3. Start development server (port 3000)
npm start

# 4. Production build
npm run build
```

---

## Environment Variables

Create a `.env` file in the `frontend/` root:

```env
# Backend API base URL
REACT_APP_API_BASE=https://kiddosintellect.com/api

# Firebase (for Google OAuth + anonymous login)
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id

# Razorpay (public key only — never the secret)
REACT_APP_RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
```

> The API base URL is resolved in this priority order:
> `VITE_API_BASE` → `REACT_APP_API_BASE` → `window.API_BASE` → `https://kiddosintellect.com/api`

---

## Pages & Routes

### Customer Pages

| Route | Page | Description |
|---|---|---|
| `/` | **Home** | Landing page with dynamic CMS blocks (hero, product showcase, puzzle game, carousels). All sections lazy-loaded on scroll via `useInView`. |
| `/catalog` | **Catalog** | Product browsing with search (400ms debounce), sorting (price/date), category filters, price range filter, and pagination (20/page). |
| `/book/:slug` | **Book Detail** | Individual book page. Includes flipbook page preview (react-pageflip), image gallery, edition picker (hardcover/paperback/ebook), specs, star ratings, user reviews tab, and add-to-cart. |
| `/cart` | **Cart** | Cart items with qty controls, subtotal/shipping summary. Syncs with server when logged in, falls back to local Zustand store otherwise. |
| `/checkout` | **Checkout** | Full checkout: address form, coupon code, shipping fee calculation, two payment modes (full online or half+COD), Razorpay integration, puzzle reward discount (20% off highest-price item). |
| `/login` | **Customer Auth** | Register and login. Supports email+OTP, phone+password, Google OAuth, and anonymous login. Includes fake phone detection and OTP resend with cooldown. |
| `/profile` | **Customer Profile** | Logged-in user's name, email, phone, address, and recent orders. |
| `/profile/orders` | **Order History** | Paginated order list with status badges, detail modal (items, tracking, payment info), copy AWB, open tracking link, and payment retry for pending orders. |
| `/invoice/:id` | **Invoice** | Printable invoice for a completed order. |
| `/aboutus` | **About Us** | Company story and team info. |
| `/preschool` | **PreSchool** | PreSchool program details page. |
| `/faq` | **FAQ** | Frequently asked questions. |
| `/contact` | **Contact Us** | Contact form and info. |
| `/privacy` | **Privacy Policy** | Privacy policy. |
| `/shipping` | **Shipping Policy** | Shipping policy. |
| `/terms` | **Terms & Conditions** | Terms of service. |
| `/refund` | **Refund Policy** | Refund and return policy. |

#### Route Protection

- **AdminGuard** — wraps all `/admin/*` routes; redirects to `/admin/login` if not authenticated.
- **PageGate** — wraps public pages; hides/redirects based on visibility rules from `SiteConfig`.
- **RequireCustomer** — used on `/cart`, `/checkout`, `/profile`, `/profile/orders`; redirects to `/login` with a redirect-back state.

---

### Admin Pages

All admin pages are under `/admin/*` and protected by `AdminGuard`. They share the `AdminLayout` (collapsible sidebar + content area).

| Route | Page | Description |
|---|---|---|
| `/admin/login` | **Login** | Email + password admin auth. Stores `admin_jwt` in localStorage. |
| `/admin/setup` | **Setup** | One-time first-admin setup wizard. |
| `/admin/dashboard` | **Dashboard** | 4-tab overview: **Overview** (revenue, orders, inventory metrics), **Business** (Recharts revenue/order trend charts, top products), **Customers** (admin list, enable/disable with cooldown, delete), **Storage** (asset usage by category). Also shows abandoned cart stats and DB metrics. |
| `/admin/books` | **Books** | Book inventory with search, visibility filter (public/draft/all), pagination (50/page), bulk select, toggle visibility, delete with confirmation, CSV export/import. |
| `/admin/add-book` | **Add Book** | Full book creation form: title, authors, publisher, SKU, ISBN, edition, pricing (MRP/sale/discount%), description, content, specs (age group, pages, language, illustrator), asset uploads (cover, preview pages, flipbook), categories, tags, inventory, visibility, SEO meta, icon selector. Auto-generates slug from title. |
| `/admin/books/:slug/edit` | **Edit Book** | Same form as Add Book but pre-populated. Includes delete option. |
| `/admin/categories` | **Categories** | Create, edit, delete, and search product categories. |
| `/admin/orders` | **Orders** | Full order management: search by ID/name/email, filter by status/date/payment, pagination. **Shiprocket** two-phase flow (create orders → assign courier + label). **BlueDart** direct shipment creation. Courier selection modal with dimensions. Label printing. Manifest creation. AWB tracking. Offline order creation (cash sales form). Refund processing with reason and speed options. Bulk selection for batch shipping. |
| `/admin/payments` | **Payments** | Razorpay API credentials, test mode toggle, webhook URL. |
| `/admin/settings` | **Site Settings** | Site title, logo upload (with preview), favicon upload. |
| `/admin/homepage` | **Homepage Editor** | Add/edit/remove CMS homepage blocks. Block types: hero, products, carousel, text, testimonials, puzzle. Control title, description, image, spacing, and order. |
| `/admin/catalog` | **Catalog Settings** | Catalog slider and featured product carousel configuration. |
| `/admin/email-senders` | **Email Senders** | SMTP/SendGrid/custom provider setup. Create, edit, delete, test, and set default sender. |
| `/admin/email-templates` | **Email Templates** | Slug-based transactional email templates. HTML content editor with variable placeholder support. Test email sending. |
| `/admin/shiprocket` | **Shiprocket** | Profile/credentials, order syncing, courier comparison, rate lookup, pickup scheduling. |
| `/admin/api-users` | **API Users** | Multi-provider credential storage for **BlueDart** and **Shiprocket**. Test connection, activate/deactivate, create/edit/delete. |
| `/admin/shipping-rules` | **Shipping Rules** | Tiered shipping fee rules by order value and payment type (online vs. COD). |
| `/admin/coupons` | **Coupons** | **Coupons tab**: create, edit, delete, activate/deactivate. Fields: code, type (% or fixed), min order, min qty, max uses, expiry, first-order-only, required book. **Report tab**: per-coupon usage stats. |
| `/admin/popup` | **Popup Settings** | Dynamic popup config: trigger rules (new/returning user, page), content type (image, product, countdown), timing, frequency, and dismissal behavior. |
| `/admin/ai-settings` | **AI Settings** | AI/automation settings: auto-reply, recommendation engine, content generation. |
| `/admin/reviews` | **Reviews** | Review moderation: approve/reject, filter by status, edit content, delete, bulk approve. |

---

## State Management & Contexts

The app uses a combination of **React Context** (for auth and config) and **Zustand** (for the shopping cart).

### `Auth` Context (`contexts/Auth.jsx`)
Manages **admin** authentication.

- **State**: `token`, `role`, `isAdmin`
- **Methods**: `login(token, role)`, `logout()`
- **Storage**: `localStorage` keys `admin_jwt`, `admin_role`

---

### `CustomerAuth` Context (`contexts/CustomerAuth.jsx`)
Manages **customer** authentication, profile, and triggers cart hydration.

- **State**: `token`, `customer` (profile object), `isCustomer`, `loading`
- **Methods**:
  - `login({ email, phone, password })` — email or phone + password
  - `register({ name, email, phone, password, emailOtpTicket })`
  - `googleLogin()` — Firebase → backend OAuth flow
  - `loginAnonymously()` — Firebase anonymous sign-in
  - `logout()` — clears session
  - `refresh()` — validates token on app mount and fetches profile
- **Storage**: `localStorage` key `customer_jwt`
- On login, automatically calls `replaceAll()` on the cart store to hydrate from server.

---

### `CartStore` (Zustand — `contexts/CartStore.jsx`)
Client-side shopping cart with localStorage persistence.

**Cart item shape:**
```js
{
  _id: "local_<bookId>_<timestamp>",  // Temp ID (pre-server-sync)
  bookId: "<mongoId>",
  title, authors, price, mrp, qty,
  coverUrl, slug
}
```

**Methods:**
| Method | Description |
|---|---|
| `add(book, qty)` | Add item or increment existing |
| `setQty(itemId, qty)` | Set exact quantity |
| `inc(itemId)` | Increment by 1 |
| `dec(itemId)` | Decrement by 1 (min 1) |
| `remove(itemId)` | Remove from cart |
| `clear()` | Empty cart |
| `replaceAll(items)` | Hydrate from server (on login) |
| `cleanInvalidItems()` | Remove invalid entries on startup |

- Persists to `localStorage` key `cart_items`
- Validates book objects before adding (checks ID format, price, title)
- Handles both local temp IDs and server permanent IDs

---

### `SiteConfig` Context (`contexts/SiteConfig.jsx`)
Fetches and distributes public site settings from `/api/settings/public`.

- **State**: `site` (title, logoUrl, faviconUrl), `theme`, `homepage` (blocks), `payments`, `visibility` (page-gate rules), `loaded`
- Applies theme tokens to CSS custom properties on load
- Updates favicon and `document.title` dynamically
- Used by `PageGate` and `Navbar` to control visibility

---

### `ThemeContext` (`contexts/ThemeContext.jsx`)
Client-side CSS variable management for theme customization.

- **State**: `theme` (object of CSS variable values)
- Loads from `localStorage` on init, persists changes
- Updates `document.documentElement` CSS variables on change
- Tokens: `color-primary`, `color-secondary`, `color-accent`, `color-bg`, `color-card`, `color-text`, `radius`, `shadow`, `font-sans`

---

## Custom Hooks

### `useCartCleanup` (`hooks/useCartCleanup.js`)
Runs once on app startup. Validates every cart item's book ID format and removes any that are invalid or refer to deleted books. Uses a `useRef` flag to prevent re-runs within a session.

### `useInView` (`hooks/useInView.js`)
IntersectionObserver wrapper for lazy-loading page sections.

```js
const { ref, inView } = useInView({ rootMargin: "200px" });
```

Returns a `ref` to attach to the target element and `inView` boolean that becomes `true` when the element is near the viewport. Fires once per element (triggerOnce pattern). Used on the Home page to defer data fetching for below-the-fold sections.

---

## API Layer

### `api/client.jsx` — Central Axios Instance

All API calls go through one configured Axios instance:

- **Base URL**: Resolved from env vars (see [Environment Variables](#environment-variables))
- **Timeout**: 20 seconds
- **Auth injection**: Automatically attaches `Authorization: Bearer <token>` based on:
  - `meta.auth` directive passed in request config (`"admin"`, `"customer"`, `"none"`)
  - URL pattern fallback (`/admin/*` → admin token, `/customer/*` → customer token)
- **FormData detection**: Removes `Content-Type` for multipart uploads
- **401 handling**: Redirects to the appropriate login page (`/admin/login` or `/login`)
- **Logging**: Console logs all requests and error responses

---

### `api/customer.jsx` — Customer & Cart Endpoints

```js
CustomerAPI.register(payload)
CustomerAPI.login(payload)
CustomerAPI.me(token)
CustomerAPI.updateProfile(token, patch)
CustomerAPI.getCart(token)
CustomerAPI.addToCart(token, { bookId, qty })
CustomerAPI.setCartQty(token, { itemId, qty })
CustomerAPI.removeCartItem(token, itemId)
CustomerAPI.clearCart(token)

CustomerOTPAPI.start(email)           // Start OTP flow
CustomerOTPAPI.verify(email, otp)     // Verify OTP, returns ticket
```

---

### `api/asset.jsx` — Asset URL Helpers

```js
assetUrl(relativePath, size)          // Builds full CDN/R2 URL from stored path
toRelativeFromPublic(input)           // Strips domain, returns relative path
```

Supports both absolute CDN URLs and relative local paths. Auto-detects origin from API base URL.

---

### `api/categories.jsx`

```js
CategoriesAPI.list()
CategoriesAPI.create(data)
CategoriesAPI.remove(id)
```

---

### `api/bluedart.jsx` — BlueDart Shipping

```js
BlueDartAPI.createShipment(orderId, profileId)
BlueDartAPI.createShipments(orderIds, profileId, customDetails)
BlueDartAPI.trackAwb(awbNo)
BlueDartAPI.schedulePickup(data)
BlueDartAPI.cancelPickup(confirmationNumber, reason, orderIds)
BlueDartAPI.cancelShipment(awbNumber, reason, orderId)
BlueDartAPI.generateLabel(orderId)
BlueDartAPI.generateLabelOnDemand(orderId)
BlueDartAPI.bulkGenerateLabels(orderIds)
BlueDartAPI.downloadLabel(fileName)
BlueDartAPI.checkPincode(pincode)
BlueDartAPI.getTransitTime(fromPincode, toPincode, productCode, pickupDate)
BlueDartAPI.listProfiles()
BlueDartAPI.saveProfile(profile)
BlueDartAPI.deleteProfile(id)
```

---

### `api/shiprocket.jsx` — Shiprocket Shipping (Two-Phase Flow)

```js
ShipAPI.create(orderIds, dimensions)     // Phase 1: Create Shiprocket orders
ShipAPI.assignCourier(selections)        // Phase 2: Assign courier + generate labels
ShipAPI.fetchCouriers(orderId)           // Re-fetch available couriers
ShipAPI.label(orderIds)                  // Generate shipping labels
ShipAPI.manifest(orderIds)               // Create pickup manifest
ShipAPI.track(awb)                       // Track by AWB
ShipAPI.cancel(shipment_id)             // Cancel shipment
```

---

### `api/emails.jsx` — Email Templates & Senders

```js
// Templates
EmailAPI.listTemplates()
EmailAPI.createTemplate(payload)
EmailAPI.updateTemplate(idOrSlug, payload)
EmailAPI.deleteTemplate(idOrSlug)
EmailAPI.testTemplate(slug, body)

// Senders
EmailAPI.listSenders()
EmailAPI.createSender(payload)
EmailAPI.updateSender(id, payload)
EmailAPI.deleteSender(id)
EmailAPI.testSender(id, body)
```

---

## Components

### `Navbar`
Fixed header with blur/transparency scroll effect. Desktop shows full nav links (Home, Catalog, About Us, Sacred Stories). Mobile has hamburger slide-out menu. Shows cart badge with item count, customer name + logout dropdown when logged in, and admin icon for admin users.

### `Footer`
Multi-section layout: contact info (email, phone, address, hours), quick policy links, social icons (Instagram, WhatsApp, Threads, X, Facebook), and an SVG wave separator. Auto-updates copyright year.

### `ProductCard`
Reusable book card with cover image (with error fallback), discount badge, title/author, MRP strikethrough + sale price, star rating, and Add to Cart button. Button changes to "View Cart" if already in cart. Memoized price calculations, lazy image loading, hover effects.

### `DynamicPopup`
Fetches active popup config from `/api/settings/popup/active`. Session-aware: doesn't show more than once per session or more than once per 24 hours (localStorage). Supports image popups and product showcase popups. Preloads image before display. Mounts 3 seconds after app load to avoid impacting Total Blocking Time.

### `SEO`
Meta tag manager via `react-helmet-async`. Sets `<title>`, `<meta>` description/keywords, Open Graph tags, canonical URL, and JSON-LD structured data (Organization, Product, Breadcrumb, FAQ schemas).

### `RouteGuard`
- **AdminGuard**: Checks `admin_jwt` from `AuthContext`. Redirects to `/admin/login` if missing.
- **PageGate**: Reads page visibility from `SiteConfig`. Redirects to `/` if the page is hidden or requires admin access.

### `ProgressivePuzzleGame`
Full sliding tile puzzle game with 3 difficulty levels (3×3, 4×4, 5×5). Features move counter, move limits, drag/touch tile swapping, level progression, win animation, best score tracking (localStorage), and a reward trigger — solving the puzzle awards a 20% discount coupon usable in checkout.

### `AdminLayout` + `AdminSidebar`
Two-column admin shell. Sidebar has grouped nav links (Content, Orders/Shipping, Settings, Integrations) with icons, active route highlighting, and a mobile collapse toggle.

### `ScrollToTopButton`
Floating button that appears after scrolling down. Smooth-scrolls to top on click with fade in/out animation.

### `OptimizedImage`
Progressive image loading with placeholder support, lazy loading, and error boundary.

### `WaveText`
Letter-by-letter oscillating wave text animation. Used in Navbar nav links. Configurable speed, height, and color.

### `LoadingFallback`
Shimmer skeleton UI shown during lazy route loading to prevent layout shift.

### Toast System (`lib/toast.js`)
Typed notification helpers wrapping react-toastify:
```js
t.success(msg)
t.error(msg)
t.info(msg)
t.warn(msg)
t.loading(msg)   // Returns ID for manual dismissal
t.dismiss(id)
```
Message can be a string or `{ title, detail?, sub?, chip? }` for rich notifications.

---

## Styling & Theming

### Tailwind Config Highlights

- **Dark mode**: Class-based (`.dark`)
- **Custom breakpoints**: `xs` (480px) up to `4xl` (2560px)
- **Semantic color tokens** via CSS variables: `color-brand`, `color-accent`, `color-fg`, `color-surface`, `color-border`, `color-success`, `color-danger`
- **Admin color palette**: Stormy blue series
- **Font families**: Inter (sans-serif), Instrument Serif (serif)
- All colors defined as CSS HSL variables for runtime theme switching

### CSS Files

| File | Purpose |
|---|---|
| `styles/classic-light.css` | Additional light theme overrides and golden accent styles |
| `styles/DynamicPopup.css` | Popup open/close animations |
| `App.css` | Root-level resets and container styles |
| `index.css` | Tailwind base/components/utilities directives |

---

## External Integrations

### Razorpay (Payments)
Loaded dynamically via script tag on checkout. Supports:
- **Full online payment** (100% via Razorpay)
- **Half online + COD** (50% online, 50% cash on delivery)
- Signature verification via backend
- Payment retry for pending/partially-paid orders

### Shiprocket (Shipping)
Two-phase workflow:
1. **Create orders** in Shiprocket (send dimensions)
2. **Assign courier** from available options → auto-generates label

### BlueDart (Shipping)
Direct shipment creation and tracking. Single-phase. Supports bulk label generation, manifest creation, pincode serviceability check, and transit time estimation.

### Firebase (Authentication)
Used only for Google OAuth and anonymous sign-in. Lazy-initialized on demand — not loaded on initial page paint. `getAuthInstance()` and `getGoogleProvider()` are called only when customer opens the auth page.

### Cloudflare R2 / CDN (Assets)
Book cover images and flipbook preview pages are served from an external CDN/R2 bucket. `api/asset.jsx` handles URL normalization between stored relative paths and full CDN URLs.

---

## Performance & Architecture

### Code Splitting
- All route components except `Home` are **lazy-loaded** (`React.lazy + Suspense`)
- `Footer` and `DynamicPopup` are lazy-loaded (popup delayed 3s)
- Firebase auth is initialized on-demand only
- Admin pages are split into a separate chunk from customer pages

### Lazy Data Loading
- `useInView` hook delays API calls for below-the-fold sections until they approach the viewport (200px preload margin)
- Prevents unnecessary requests on initial page load

### Cart Persistence
- Cart survives page refresh via `localStorage` (Zustand persist middleware)
- On customer login, server cart is fetched and merged via `replaceAll()`
- `useCartCleanup` removes stale/invalid items on startup

### Image Optimization
- Build-time WebP conversion (`imagemin-webp` script)
- `OptimizedImage` component with lazy loading and error fallback
- Vercel cache headers: 1-year immutable cache for all static assets and images

### SEO
- `react-helmet-async` for per-page meta tags
- JSON-LD structured data (Product, Organization, Breadcrumb, FAQ)
- Auto-generated sitemap at build time (`scripts/generate-sitemap.js` runs via `prebuild`)

### Caching (Vercel Headers via `vercel.json`)

| Asset Type | Cache Strategy |
|---|---|
| `/static/*` | `public, max-age=31536000, immutable` (1 year) |
| Images, fonts | `public, max-age=31536000, immutable` (1 year) |
| `/index.html` | `no-cache, no-store, must-revalidate` (always fresh) |

---

## Deployment

The app deploys automatically to **Vercel** on push to the main branch.

`vercel.json` configures:
- Cache-control headers for assets and HTML
- All routes rewrite to `index.html` (required for client-side routing with React Router)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

To deploy manually:
```bash
npm run build
# Upload the /build directory to Vercel or any static host
```

The **backend** runs separately as a Node.js/Express app (PM2) at `kiddosintellect.com`. The frontend communicates with it exclusively through the `/api/*` prefix.

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start development server on port 3000 |
| `npm run build` | Production build (runs sitemap generator first) |
| `npm test` | Run test suite |
| `npm run generate-sitemap` | Manually regenerate sitemap.xml |
| `npm run tunnel` | LocalTunnel for mobile testing (port 3000) |
